const express = require('express');
const { start } = require('repl');
const app = express();
const port = process.env.PORT || 3000;


async function startWebhook() {
    app.use(express.json());

    app.post('/webhook', (req, res) => {
        console.log(req.body); // Handle the webhook payload
        res.status(200).send('Webhook received');
    });
    app.listen(port, () => {
        console.log(`Webhook listening on port ${port}`);
    });
}
module.exports = { startWebhook };
