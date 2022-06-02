const { MongoClient } = require('mongodb');
const uri = require('./database_uri.js');

let spherified = false;
let connected = false;
const client = new MongoClient(uri);

const main = async (func, params) => {
    const ret = await connectDatabase() 
        .then(() => {
            // specify the database to store points in a circle
            if (!spherified) {
                client.db('pondnet_db').collection('rinks').createIndex({location: '2dsphere'}); // only call this once
                spheriphied = true;
            }
        })
        .then(async () => await func(client, ...params))
        .catch(error => { // will catch all errors thrown in the promises
            console.log(error);
            return {
                'code': -1,
                'val': null
            };
        });

    return ret;
};

const connectDatabase = async () => {
    if (connected) {
        return client;
    }

    await client.connect();
    connected = true;
    return client;
};

const addRink = async (client, rink) => {
    // error will be caught in main function
    await client
        .db('pondnet_db')
        .collection('rinks')
        .insertOne(rink);

    return {
        'code': 0,
        'val': null
    };
};

const getRinks = async (client, coordinates, distance) => {
    // error will be caught in main function
    const rinks = await client
        .db('pondnet_db')
        .collection('rinks')
        .find({
            location: {
                $near: {
                    $geometry: { 
                        type: 'Point', 
                        coordinates: coordinates
                    },
                    $maxDistance: distance
                }
            }
        })
        .toArray();

    return {
        'code': 0,
        'val': rinks
    };
};

module.exports = {
    'database': main,
    'addRink': addRink,
    'getRinks': getRinks
};

