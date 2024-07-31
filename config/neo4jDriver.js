const neo4j = require('neo4j-driver');
require('dotenv').config();

let driver;

exports.initDriver = async function() {
    driver = neo4j.driver(
        process.env.NEO4J_URI,
        neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
        { database: process.env.NEO4J_DATABASE }
    );
    return driver;
}

exports.getDriver = function() {
    return driver;
}
