const connectwiseAPI = require("./connectwiseAPI"); // ConnectWise API logic

async function handleDeleteCompany(id, context, authState) {
    try {

        // Create a new company
        newCompany = await connectwiseAPI.deleteSalesTicket(id, context, authState);
        //console.log('New Company:', newCompany);

    } catch (error) {
        console.error('An error occurred:', error.message);
    }
}
module.exports = { handleDeleteCompany };