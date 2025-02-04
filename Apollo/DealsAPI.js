const fs = require('fs');

class DealsAPI {
    constructor() {
        this.apiKey = "rwYHYDXtbYkuXRImQKoDVA";  // Replace with actual API key
        this.baseUrl = 'https://api.apollo.io/api/v1/opportunities/search';
        this.headers = {
            'accept': 'application/json',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey
        };
    }

    // Fetch all deals and write to file
    async dumpDealsToFile() {
        const results = await this.getAllDeals();

        fs.writeFileSync('deals.json', JSON.stringify(results, null, 2));
        //console.log("Results written to deals.json");

        const data = JSON.parse(fs.readFileSync('deals.json', 'utf-8'));

        const processedDeals = data.map(deal => new Deal(deal));

        const output = processedDeals.map(deal => {
            return `Deal ID: ${deal.id} | Name: ${deal.name} | Stage: ${deal.stage} | ` +
                `Amount: ${deal.amount || 'N/A'} | Close Date: ${deal.close_date || 'N/A'}`;
        }).join('\n\n');

        fs.writeFileSync('deals.txt', output);
        //console.log('Deals written to deals.txt');
    }

    // Fetch all paginated deals
    async getAllDeals() {
        let allResults = [];
        let currentPage = 1;

        while (true) {
            const requestBody = {
                per_page: 100,
                page: currentPage
            };

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                console.log(`Error: ${response.status}`);
                break;
            }

            const responseData = await response.json();
            allResults = allResults.concat(responseData.opportunities || []);

            if (responseData.opportunities.length < 100) {
                break;
            }

            currentPage++;
        }

        return allResults;
    }

    // Fetch a specific deal by opportunity ID
    async getDealById(opportunityId) {
        try {
            const deal = await deals.getDealById(opportunityId);
            console.log("Deal: ", deal);
        } catch (error) {
            console.error('Error fetching deal:', error);
        }
    }

}

class Deal {
    constructor(deal) {
        this.id = deal.id;
        this.name = deal.name || 'Unnamed Deal';
        this.stage = deal.stage || 'Unknown Stage';
        this.amount = deal.amount || 'Not Specified';
        this.close_date = deal.close_date || 'No Date';
    }
}

module.exports = { DealsAPI };
