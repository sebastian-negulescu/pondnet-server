const { MongoClient } = require('mongodb');
const uri = require('./database_uri.js');

const main = async (func, params) => {
    const client = new MongoClient(uri);
    let ret_value;

    try {
        await client.connect();
        client.db('pondnet_db').collection('rinks').createIndex({location: '2dsphere'}); // only call this once

        // call the given function with parameters
        // params is an array of parameters to pass
        ret_value = await func(client, params);
    } finally {
        await client.close();
    }

    return ret_value;
};

const addRink = async (client, rink) => {
    await client.db('pondnet_db').collection('rinks').insertOne(rink);
    return 200;
};

const getRinks = async (client, coordinates) => {
    const rinks = await client.db('pondnet_db').collection('rinks').find(
    {
        location:
            { $near:
                {
                    $geometry: { type: 'Point', coordinates: coordinates },
                    $maxDistance: 50000
                }
            }
    }
    );
    return rinks.toArray();
};

module.exports = {
    'database': main,
    'addRink': addRink,
    'getRinks': getRinks
};

