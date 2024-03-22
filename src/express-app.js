console.log("***********************************************************")
console.log("printing from server!")
console.log("***********************************************************")
const express = require('express');
// const { expressPort } = require("../package.json");
const cors = require('cors');
const name = 'golden-path';
const expressPort = '3131';

const app = express();
let transactionId = 0;

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
    res.send("Greetings " + name + ", " + " -- txnId: " + transactionId++)
  }
  else {
    res.send("Greetings stranger! -- txnId: " + transactionId++);
  }
})

app.get('/info', (req, res) => {
  res.send("Here is some info... (jk) -- txnId: " + transactionId++);
})

app.listen(expressPort, () => {
  console.log(`Example app listening on port ${expressPort}`)
})