const express = require('express');
const https = require('https');
const fs = require('fs');
const { database, addRink, getRinks } = require('./database.js');

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

/*
 * rink object
 * {
 *     coords: {
 *         lat: float,
 *         long: float
 *     },
 *     rating: int,
 *     size: string,
 *     busy: bool
 * }
 */

/* server routes */

// handles a request to put a rink in the database
app.post('/report', (req, res) => {
    const body = req.body;
    // check that it has coordinates
    console.log(body);
    if (!('location' in body && Array.isArray(body['location']['coordinates']))) {
        res.sendStatus(400); // error
        return; // does not have valid coordinates
    }

    body['location']['type'] = 'Point';
    database(addRink, [body])
        .then(ret_obj => {
            const code = ret_obj['code'];
            if (code === 0) {
                res.sendStatus(200); // success
                return;
            }

            res.sendStatus(400); // error
        })
        .catch(err => {
            res.sendStatus(400); // error
            console.error(err)
        });
});

// handles a request to fetch rinks
app.post('/find', (req, res) => {
    const body = req.body;
    const coordinates = body['location']['coordinates'];
    if (coordinates === null) {
        res.sendStatus(400);
        return;
    }

    database(getRinks, [coordinates, 50000])
        .then(ret_obj => {
            const code = ret_obj['code'];
            if (code === 0) {
                console.log(ret_obj['val']);
                res.send(ret_obj['val']);
                return;
            }

            res.sendStatus(400);
        })
        .catch(err => {
            res.sendStatus(400);
            console.error(err)
        });
});

/* create server */
const httpsServer = https.createServer(options, app);
httpsServer.listen(port, () => {
    console.log(`listening on port ${port}...`);
});
