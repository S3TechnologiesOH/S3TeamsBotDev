const connectwiseAPI = require("./connectwiseAPI"); // ConnectWise API logic

async function handleCreateCompany(context, companyName, address, contactInfo, rep, companyId) {
    try {

        // Setup company details based on input
        var newCompanyDetails = {
            name : companyName,
            address: address,
            contactInfo: contactInfo,
            rep: rep,
            identifier : companyId,
            site: {
                id: Main,
                name: Main
            }
        };


        // Create a new company
        let newCompany = await connectwiseAPI.createCompany(context, newCompanyDetails);
        console.log('New Company:', newCompany);

        console.log('New Ticket:', newTicket);

    } catch (error) {
        console.error('An error occurred:', error.message);
    }
}
module.exports = { handleCreateCompany };