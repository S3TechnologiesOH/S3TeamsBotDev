const { CardFactory } = require("botbuilder");

async function showSetUserPermissionsCard(context) {
  const setUserPermissionsCard = {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: "Set User Permissions",
        weight: "Bolder",
        size: "Large",
        wrap: true,
      },
      {
        type: "TextBlock",
        text: "You can use the form below to assign roles to users.",
        wrap: true,
        spacing: "Medium",
      },
      {
        type: "Input.Text",
        id: "roleName",
        placeholder: "Enter the role (e.g., ticket_management)",
        isRequired: true,
      },
      {
        type: "Input.Text",
        id: "userEmail",
        placeholder: "Enter the user's email",
        isRequired: true,
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Assign Role",
        data: {
          action: "assignRoleCommand",
        },
      },
      {
        type: "Action.Submit",
        title: "Back to Main Menu",
        data: {
          action: "showAdminCommandsCardMenu",
        },
      },
    ],
  };

  await context.sendActivity({
    attachments: [
      { contentType: "application/vnd.microsoft.card.adaptive", content: setUserPermissionsCard },
    ],
  });
}

module.exports = { showSetUserPermissionsCard };
