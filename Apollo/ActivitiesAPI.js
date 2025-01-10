const fs = require('fs');

class Activity {
    constructor(activity, opportunityId) {
        this.id = activity.id;
        this.opportunity_id = opportunityId;
        this.type = activity.type;
        this.emailer_message = activity.type === 'emailer_message' ? new EmailerMessage(activity.emailer_message) : null;
        this.user_action = activity.type === 'user_action' ? new UserAction(activity.user_action) : null;
    }
}

class EmailerMessage{
    constructor(emailer_message){
    this.id = emailer_message.id;
    this.subject = emailer_message.subject;
    this.body = emailer_message.body;
    this.to_email = emailer_message.to_email;
    this.from_email = emailer_message.from_email;
    }
}

class UserAction{    
    constructor(user_action){
        this.id = user_action.id;
        this.user_id = user_action.user_id;
        this.type = user_action.type;
    }

}


class ActivitiesAPI {
    constructor() {
        this.apiKey = "rwYHYDXtbYkuXRImQKoDVA";  // Replace with actual API key
        this.url = 'https://api.apollo.io/v1/activities/';
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
async dumpResultsToFile(opportunityId) {
    const api = new ActivitiesAPI();
    const results = await this.getAllResults(api.url, api.data, api.headers, opportunityId);

    fs.writeFileSync('activities.json', JSON.stringify(results, null, 2));
    //console.log("Results written to activities.json");

    // Read and process the file
    const data = JSON.parse(fs.readFileSync('activities.json', 'utf-8'));

    const processedActivities = data.map(activity => new Activity(activity, opportunityId));

    // Write processed activities to a txt file
    const output = processedActivities.map(activity => {
        return `Activity ID: ${activity.id} | Opportunity ID: ${activity.opportunity_id} | Type: ${activity.type} | ` +
               `Emailer Message: ${activity.emailer_message ? JSON.stringify(activity.emailer_message) : 'N/A'} | ` +
               `User Action: ${activity.user_action ? JSON.stringify(activity.user_action) : 'N/A'}`;
    }).join('\n');

    fs.writeFileSync('activities.txt', output);
    //console.log('Activities written to activities.txt');
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
        allResults = allResults.concat(responseData.activities || []);

        if (responseData.activities.length < 100) {
            // Break if results are less than per_page limit
            break;
        }

        currentPage++;
    }

    return allResults;
}


}

module.exports = { ActivitiesAPI };






