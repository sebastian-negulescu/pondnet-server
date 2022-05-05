const express = require('express');
const https = require('https');
const fs = require('fs');

/* server constants */
const port = 8000;
const app = express();

/* used for local https */
const options = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem'),
};

/* used for local development CORS */
// Add headers before the routes are defined
app.use((req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(express.json());

/* server routes */

// handles a request to put a rink in the database
app.post('/report', (req, res) => {
    // req.body is what we are looking for
    res.send(0);
});

// handles a request to fetch rinks
app.post('/find', (req, res) => {
    let ponds = [];
    // fetch ponds from database
    res.send(ponds);
});

/* create server */
const httpsServer = https.createServer(options, app);
httpsServer.listen(port, () => {
    console.log(`listening on port ${port}...`);
});
