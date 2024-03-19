const express = require('express');
// const { HelloNapi, ObjectWrapDemo } = require("./lib/binding.js");
const app = express();
const port = 3131;
let transactionId = 0;

app.get('/', (req, res) => {
  res.send('Hello World ' + helloNapiResponse);
})

app.get('/greet', (req, res) => {
  const name = req.query.name; // fetch the 'name' parameter from request query
  /*
  const greeter = new ObjectWrapDemo('Express Server');
  if (name) {
    res.send(greeter.greet(name) + " -- txnId: " + transactionId++)
  }
  else {
    res.send(greeter.greet('stranger') + " -- txnId: " + transactionId++);
  }
  */
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})