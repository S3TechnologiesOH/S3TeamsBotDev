const fs = require('fs');
const {extractParagraphText} = require('./ConnectWiseAPI.js')
class NotesAPI {
    constructor() {
        this.apiKey = "rwYHYDXtbYkuXRImQKoDVA";  // Replace with actual API key
        this.url = 'https://api.apollo.io/v1/notes/';
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
    async dumpNotesResultsToFile(opportunityId) {
        const api = new NotesAPI();
        const results = await this.getAllResults(api.url, api.data, api.headers, opportunityId);

        fs.writeFileSync('notes.json', JSON.stringify(results, null, 2));
        console.log("Results written to notes.json: ", results);

        // Read and process the file
        const data = JSON.parse(fs.readFileSync('notes.json', 'utf-8'));

        const processedNotes = data.map(note => new Note(note, opportunityId, results));

        // Write processed notes to a txt file
        const output = processedNotes.map(note => {
            return `Note ID: ${note.id} | Opportunity ID: ${note.opportunity_id} | Title: ${note.title} | ` +
                `Author: ${note.author} | Created At: ${note.created_at} | Updated At: ${note.updated_at} | ` +
                `Body: ${note.body}`;
        }).join('\n\n');

        fs.writeFileSync('notes.txt', output);
        console.log('Notes written to notes.txt');
        return { raw: results, processed: processedNotes };
    }

// Fetch paginated results
async getAllResults(url, data, headers, opportunityId) {
    let allResults = [];
    let currentPage = 1;

    while (true) {
        data.page = currentPage;
        data.opportunity_id = opportunityId;

        const queryString = new URLSearchParams(data).toString();
        const fullUrl = `${url}?${queryString}`;

        const response = await fetch(fullUrl, { method: 'GET', headers: headers });
        
        if (!response.ok) {
            console.log(`Error: ${response.status}`);
            break;
        }

        const responseData = await response.json();
        allResults = allResults.concat(responseData.notes || []);

        if (responseData.notes.length < 100) {
            // Break if results are less than per_page limit
            break;
        }

        currentPage++;
    }

    return allResults;
}

}

class Note {
    constructor(note, opportunityId, rawNote) {
        this.id = note.id;
        this.opportunity_id = opportunityId;
        this.title = note.title || 'Untitled';
        this.body = extractParagraphText(rawNote); // Extract the note body
        this.created_at = note.created_at;
        this.updated_at = note.updated_at;
        this.author = note.author ? note.author.name : 'Unknown';
    }
}




// Export the function for external usage
module.exports = { NotesAPI };
