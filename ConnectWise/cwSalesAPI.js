const { ManageAPI } = require('connectwise-rest');
// Set your ConnectWise configuration
const connectwiseUrl = process.env.CW_URL;
const companyId = process.env.CW_COMPANY_ID;
const publicKey = process.env.CW_PUBLIC_KEY;
const privateKey = process.env.CW_PRIVATE_KEY;
const clientId = process.env.CW_CLIENTID;
const authKey = process.env.CW_AUTHKEY;

// Authenticate with ConnectWise using a basic auth header
let cwManage;

try {
    console.log("Initializing ConnectWise APIs...");
    console.log("Configuration: ", {
      connectwiseUrl,
      companyId,
      publicKey,
      privateKey,
      clientId,
      authKey: authKey ? "Provided" : "Not Provided"
    });
  
    const CWMOptions = {
      companyId: companyId,
      publicKey: publicKey,
      privateKey: privateKey,
      companyUrl : "api-na.myconnectwise.net",
      clientId: clientId
    }
  
    cwManage = new ManageAPI(CWMOptions);
    console.log("Sales APIs initialized successfully.");

  } catch (error) {
    console.error("Error initializing ConnectWise API:", error);
    throw new Error("Failed to initialize ConnectWise API.");
  }


  async function createOpportunity({ notes, contactId }) {
    if (!cwManage) {
      throw new Error("ConnectWise API is not initialized.");
    }
  

  
    try {
      console.log("Creating opportunity with notes and contact...");
      const createdOpportunity = await cwManage.postSalesOpportunities(opportunity);
      console.log("Opportunity created successfully:", createdOpportunity);
      return createdOpportunity;
    } catch (error) {
      console.error("Error creating opportunity:", error);
      throw new Error("Failed to create opportunity.");
    }
  }

async function createOpporitunityContact(){


}

async function createOpporitunityNote(){
    

}

async function createOpporitunityActivity(){


}