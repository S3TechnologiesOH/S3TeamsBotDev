const connectwiseAPI = require("./connectwiseAPI"); // ConnectWise API logic

async function handleCreateCompany(context, companyName, address, contactInfo, rep, companyId, appointmentDate, appointmentTime, authState) {
    try {

        // Setup company details based on input
        const newCompanyDetails = {
            name : companyName,
            address: address,
            contactInfo: contactInfo,
            rep: rep,
            identifier : companyName,
            site: {
                id: 1,
                name: "Main"
            }
        };

        const appointmentDetails = {
            date: appointmentDate,
            time: appointmentTime
        }

        // Create a new company
        newCompany = await connectwiseAPI.createCompany(context, newCompanyDetails, appointmentDetails, authState);
        //console.log('New Company:', newCompany);

    } catch (error) {
        console.error('An error occurred:', error.message);
    }
}
module.exports = { handleCreateCompany };