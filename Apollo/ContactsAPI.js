const fs = require('fs');

class ContactsAPI {
    constructor() {
        this.apiKey = "rwYHYDXtbYkuXRImQKoDVA";  // Replace with actual API key
        this.baseUrl = 'https://app.apollo.io/api/v1/opportunities/';
        this.headers = {
            'accept': 'application/json',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey
        };
        this.data = {
            per_page: 100
        };
    }

    // Write results to a file
    async dumpContactsResultsToFile(opportunityId) {
        const results = await this.getAllResults(opportunityId);

        fs.writeFileSync('contacts.json', JSON.stringify(results, null, 2));
        //console.log("Results written to contacts.json");

        // Read and process the file
        const data = JSON.parse(fs.readFileSync('contacts.json', 'utf-8'));

        const processedContacts = data.map(contact => new Contact(contact, opportunityId));

        // Write processed contacts to a txt file
        const output = processedContacts.map(contact => {
            return `Contact ID: ${contact.id} | Opportunity ID: ${contact.opportunity_id} | Name: ${contact.name} | ` +
                `Email: ${contact.email} | Title: ${contact.title} | Company: ${contact.company} | ` +
                `Phone: ${contact.phone || 'N/A'}`;
        }).join('\n\n');

        fs.writeFileSync('contacts.txt', output);
        //console.log('Contacts written to contacts.txt');
        return { raw: results, processed: processedContacts };
    }

    // Fetch paginated results
    async getAllResults(opportunityId) {
        let allResults = [];
        let currentPage = 1;

        while (true) {
            const queryParams = new URLSearchParams({
                per_page: 100,
                page: currentPage
            }).toString();

            const fullUrl = `${this.baseUrl}${opportunityId}/contacts?${queryParams}`;

            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: this.headers
            });

            if (!response.ok) {
                console.log(`Error: ${response.status}`);
                break;
            }

            const responseData = await response.json();
            allResults = allResults.concat(responseData.contacts || []);

            if (responseData.contacts.length < 100) {
                // Break if results are less than per_page limit
                break;
            }

            currentPage++;
        }

        return allResults;
    }
}

class Contact {
    constructor(contact, opportunityId) {
        this.id = contact.id;
        this.opportunity_id = opportunityId;
        this.name = `${contact.first_name || 'N/A'} ${contact.last_name || ''}`.trim();
        this.email = contact.email || 'No email';
        this.title = contact.title || 'No title';
        this.company = contact.company ? contact.company.name : 'Unknown company';
        this.phone = contact.phone_numbers ? contact.phone_numbers[0] : null;
    }
}

// Export the class for external usage
module.exports = { ContactsAPI };
