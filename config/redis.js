 const { createClient } =require('redis');
const dotenv = require('dotenv');
dotenv.config();

const client = createClient({
    password: process.env.Redis_password,
    socket: {
        host: process.env.Redis_host,
       port : process.env.Redis_port
    }
});

client.on('error', (err) => console.log('Redis Client Error', err));

client.connect();

module.exports = client;
