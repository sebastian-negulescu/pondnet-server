const { MongoClient } = require('mongodb');
const uri = require('./database_uri.js');

const main = async (func, params) => {
    const client = new MongoClient(uri);

    try {
        await client.connect();

        // call the given function with parameters
        // params is an array of parameters to pass
        func(client, ...params);
    } finally {
        await client.close();
    }
};

const addRink = async (client, rink) => {
    await client.db("pondnet_db").collection("rinks").insertOne(rink);
};

const getRinks = async (client) => {
    const rinks = await client.db("pondnet_db").collection("rinks").find();
    const ret = rinks.toArray();
};

module.exports = {
    'main': main,
    'addRink': addRink,
    'getRinks': getRinks
};

