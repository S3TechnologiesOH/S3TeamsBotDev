const { createCompany, createSalesTicket } = require('./connectwiseAPI');

async function handleCreateCompany(context, companyName, companyAddress, companyContactInformation, rep, 
  siteName, siteAddress, siteCity, selectedState, companyId, marketChoice, appointmentDate, appointmentTime, authState) {
  
  try {
    console.log("Handling company creation request with data:", { 
      companyName, 
      companyAddress, 
      companyContactInformation, 
      rep, 
      siteName, 
      siteAddress, 
      siteCity, 
      selectedState 
    });

    // Structure company details in the format expected by createCompany function
    const companyDetails = {
      name: companyName,
      identifier: companyId,
      address: companyAddress,
      // This is the key fix - make sure contactInfo is properly set
      contactInfo: companyContactInformation,
      rep: rep,
      site: {
        _siteName: siteName,
        _siteAddress: siteAddress,
        _siteCity: siteCity,
        _siteState: selectedState
      }
    };

    // Structure appointment details
    const appointmentDetails = {
      date: appointmentDate,
      time: appointmentTime
    };

    // Call the API to create the company
    await createCompany(context, companyDetails, appointmentDetails, authState);
    await context.sendActivity(`Successfully processed company creation for ${companyName}`);

  } catch (error) {
    console.error("Error in handleCreateCompany:", error);
    await context.sendActivity(`Error creating company: ${error.message}`);
  }
}

module.exports = { handleCreateCompany };