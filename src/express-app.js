console.log("***********************************************************")
console.log("printing from server!")
console.log("***********************************************************")

const express = require('express');
const cors = require('cors');
const tryUdp = require('./sockets/try-udp.js');
const tryTcp = require('./sockets/try-tcp.js');

const name = 'celestron-wifi-tool';
const expressPort = 3131;

const app = express();
let transactionId = 0;

let moduleConfigs = {};
const broadcastPort = 55555;


app.use(cors(), (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", '"PUT, GET, POST, DELETE, OPTIONS');
  next();
})

app.get('/', (req, res) => {
  res.send('Hello World! -- txnId: ' + transactionId++);
})

app.get('/greet', (req, res) => {
  const name = req.query.name; // fetch the 'name' parameter from request query
  console.log('greeting now');
  if (name) {
    res.send("Greetings " + name + ", " + " -- txnId: " + transactionId++)
  }
  else {
    res.send("Greetings stranger! -- txnId: " + transactionId++);
  }
})

app.get('/info', async (req, res) => {
  let broadcastResponse = await tryUdp(broadcastPort);
  console.log('\texpress @ /info: ', broadcastResponse);
  res.json({...broadcastResponse, transactionId});
  transactionId++;
})

app.get('/connect', async (req, res) => {
  console.log('\texpress @ /connect');
  const {ip, port} = req.query;
  console.log(`\texpress::${ip}:${port}`);
  let configs = await tryTcp(ip, port);
  console.log('\texpress @ /connect: ', configs);
  res.json({...configs, transactionId});
  transactionId++;
})

app.listen(expressPort, () => {
  console.log(`Example app listening on port ${expressPort}`)
})