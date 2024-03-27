const express = require('express');
const cors = require('cors');
const tryUdp = require('./sockets/try-udp.js');
const tryTcp = require('./sockets/try-tcp.js');
const winston = require('winston');
const expressWinston = require('express-winston');

const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = (userDataDir) => {

  const name = 'celestron-wifi-tool';
  const expressPort = 3131;

  const userDataFile = "user-data.json";
  const getStore = async () => JSON.parse(await fs.readFile(path.join(userDataDir, userDataFile), "utf8"));
  // const getStore = async () => {
  //   let store = await fs.readFile(path.join(userDataDir, userDataFile), "utf8");
  //   logger.info('getStore = ' + store);
  //   return store;
  // };
  const updateStore = async (newStore) => await fs.writeFile(path.join(userDataDir, userDataFile), JSON.stringify(newStore));

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
  logger.info("user data file is: " +  path.join(userDataDir, userDataFile));
  logger.info("***********************************************************")

  app.use(cors(), (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", '"PUT, GET, POST, DELETE, OPTIONS');
    next();
  })

  app.get('/', async (req, res) => {
    let store = await getStore();
    logger.info('store is: ' + JSON.stringify(store));
    store.sandboxValue++;
    logger.info('store pt2 is: ' + JSON.stringify(store));
    await updateStore(store);
    let updatedStore = await getStore();
    logger.info('new store is: ' + JSON.stringify(updatedStore));
    res.send('Hello World! -- txnId: (' + JSON.stringify(updatedStore) + "), " + transactionId++);
  })

  app.get('/last-address', async (req, res) => {
    let store = await getStore();
    res.json({lastAddress: store.lastAddress, transactionId});
    transactionId++;
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

  app.post('/save', async (req, res) => {

  })

  app.listen(expressPort, () => {
    logger.info(`Example app listening on port ${expressPort}`)
  })

}