
const express = require('express');
const cors = require('cors');
const tryUdp = require('./sockets/try-udp.js');
const tryTcp = require('./sockets/try-tcp.js');
const winston = require('winston');
const expressWinston = require('express-winston');

const name = 'celestron-wifi-tool';
const expressPort = 3131;

const app = express();
let transactionId = 0;

let moduleConfigs = {};
const broadcastPort = 55555;


app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    // winston.format.colorize(),
    winston.format.json()
  ),
  meta: false,
  msg: "HTTP ",
  expressFormat: true,
  colorize: false,
  ignoreRoute: (req, res) => false
}))

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  // defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.Console()
  ]
})

logger.info("***********************************************************")
logger.info("printing from server!")
logger.info("***********************************************************")

app.use(cors(), (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", '"PUT, GET, POST, DELETE, OPTIONS');
  next();
})

app.get('/', (req, res) => {
  res.send('Hello World! -- txnId: ' + transactionId++);
})

app.get('/info', async (req, res) => {
  let broadcastResponse = await tryUdp(broadcastPort);
  res.json({...broadcastResponse, transactionId});
  transactionId++;
})

app.get('/connect', async (req, res) => {
  const {ip, port} = req.query;
  let configs = await tryTcp(ip, port);
  res.json({...configs, transactionId});
  transactionId++;
})

app.listen(expressPort, () => {
  logger.info(`Example app listening on port ${expressPort}`)
})