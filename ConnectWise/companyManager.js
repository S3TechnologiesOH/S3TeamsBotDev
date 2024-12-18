const connectwiseAPI = require("./connectwiseAPI"); // ConnectWise API logic

async function handleCreateCompany(context, companyName, address, contactInfo, rep, siteName, siteAddress, siteCity, selectedState, companyId, marketChoice, appointmentDate, appointmentTime, authState) {
    try {

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
            site: {
                _siteName: siteName,
                _siteAddress: siteAddress,
                _siteCity: siteCity,
                _siteState: selectedState
            },
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