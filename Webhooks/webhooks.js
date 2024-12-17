const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

const port = process.env.WEBSITES_PORT || 3000;

// API endpoint exposed via reverse proxy
async function startWebhook() {
    /*app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://localhost:3000', // Internal API
            changeOrigin: true,
            pathRewrite: { '^/api': '' }, // Optional: Remove "/api" prefix when forwarding
        })
    );
    
    // Your API logic
    app.post('/webhook', (req, res) => {
        console.log(req.body);
        res.status(200).send('Webhook received');
    });
    
    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
*/
}
module.exports = { startWebhook };

