const { CardFactory } = require("botbuilder");

async function showBugReportCard(context) {
  const bugReportCard = {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: "Submit a Bug Report",
        weight: "Bolder",
        size: "Large",
        wrap: true,
      },
      {
        type: "Input.Text",
        id: "bugTitle",
        placeholder: "Enter the bug title",
        isRequired: true,
        label: "Title",
      },
      {
        type: "Input.Text",
        id: "bugSummary",
        placeholder: "Describe the bug in detail",
        isMultiline: true,
        isRequired: true,
        label: "Summary",
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Send Bug Report",
        data: {
          action: "submitBugReport",
        },
      },
      {
        type: "Action.Submit",
        title: "Back to Help",
        data: {
          action: "showHelpCard",
        },
      },
    ],
  };

  // Send the Bug Report Card
  await context.sendActivity({
    attachments: [CardFactory.adaptiveCard(bugReportCard)],
  });
}

module.exports = { showBugReportCard };
