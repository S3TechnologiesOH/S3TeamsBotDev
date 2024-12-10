const express = require('express');
const app = express();
const port = process.env.WEBSITES_PORT || 3000;

app.use(express.json());

app.post('/webhook', (req, res) => {
    console.log(req.body); // Handle the webhook payload
    res.status(200).send('Webhook received');
});

app.listen(port, () => {
    console.log(`Webhook listening on port ${port}`);
});
