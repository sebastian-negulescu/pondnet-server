const express = require('express');
const fs = require('fs');
const https = require('https');

/* used for https */
const options = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem'),
};
const port = 8000;

const app = express();

/* used for local development */
// Add headers before the routes are defined
app.use(function (req, res, next) {
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

const locations = new Map(); // my database for now :)

const toKey = (lat, long) => {
    return '(' + String(lat) + ',' + String(long) + ')';
};

const test = () => {
    locations.set(toKey(43.48230083450684, -80.5436422284289), 5);
    locations.set(toKey(43.45433170825115, -80.55248278881507), 2);
    locations.set(toKey(43.47538762226163, -80.53051013387466), 4);
    locations.set(toKey(43.4730207552452, -80.52724856790694), 1);
};

test();

const toCoord = (key) => {
    const coordString = key.replace('(', '').replace(')', '').split(',');
    const coord = [parseFloat(coordString[0]), parseFloat(coordString[1])];
    return coord;
}

app.post('/report', (req, res) => {
    const key = toKey(req.body.locLat, req.body.locLong);
    // truncate to 3 or 4 decimals to make locations a bit more vague
    locations.set(key, req.body.rating);
    res.send('thanks!');
});

app.post('/find', (req, res) => {
    let ponds = [];
    for (const [key, value] of locations.entries()) {
        // convert key to numbers
        const [lat, long] = toCoord(key);
        const pond = {
            locLat: lat,
            locLong: long,
            rating: value
        };
        ponds.push(pond);
    }
    res.send(ponds);
});

const httpsServer = https.createServer(options, app);
httpsServer.listen(port, () => {
    console.log(`listening on port ${port}...`);
});