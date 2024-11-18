const connectwiseAPI = require("./connectwiseAPI"); // ConnectWise API logic

async function handleCreateCompany(context, companyName, companyId, siteId, siteName) {
    try {

        // Setup company details based on input
        const newCompanyDetails = {
            name : companyName,
            identifier : companyId,
            site: {
                id: parseInt(siteId),
                name: siteName
            }
        };


        // Create a new company
        const newCompany = await connectwiseAPI.createCompany(context, newCompanyDetails);
        console.log('New Company:', newCompany);

        //const newTicket = await cwAPI.createSalesTicket('New Sales Ticket', newCompany.id);
        console.log('New Ticket:', newTicket);

    } catch (error) {
        console.error('An error occurred:', error.message);
    }
}
module.exports = { handleCreateCompany };