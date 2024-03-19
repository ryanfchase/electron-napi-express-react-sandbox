const express = require('express');
const { expressPort } = require("../package.json");
const { HelloNapi, ObjectWrapDemo } = require("../lib/binding.js");
const cors = require('cors');

const app = express();
let transactionId = 0;

const napiModule = new ObjectWrapDemo('Napi-Express Server');

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
  if (name) {
    res.send(napiModule.greet(name) + " -- txnId: " + transactionId++)
  }
  else {
    res.send(napiModule.greet('stranger') + " -- txnId: " + transactionId++);
  }
})

app.get('/info', (req, res) => {
  res.send(napiModule.info() + " -- txnId: " + transactionId++);
})

app.listen(expressPort, () => {
  console.log(`Example app listening on port ${expressPort}`)
})