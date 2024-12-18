const connectwiseAPI = require("./connectwiseAPI"); // ConnectWise API logic

async function handleCreateCompany(context, companyName, address, contactInfo, rep, siteName, siteAddress, siteCity, siteState, companyId, marketChoice, appointmentDate, appointmentTime, authState) {
    try {

        const site = connectwiseAPI.createSite(context, siteName, siteAddress, siteCity, siteState, companyId);
        // Setup company details based on input
        const newCompanyDetails = {
            name : companyName,
            market: {
                id: 1,
                name: marketChoice
            },
            address: address,
            contactInfo: contactInfo,
            rep: rep,
            identifier : companyName,
            site: site
        };

        const appointmentDetails = {
            date: appointmentDate,
            time: appointmentTime
        }

        // Create a new company
        newCompany = await connectwiseAPI.createCompany(context, newCompanyDetails, appointmentDetails, authState);
        //console.log('New Company:', newCompanys);

    } catch (error) {
        console.error('An error occurred:', error.message);
    }
}
module.exports = { handleCreateCompany };