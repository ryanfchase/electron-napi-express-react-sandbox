const express = require('express');
const cors = require('cors');
const tryUdp = require('./sockets/try-udp.js');
const tryTcp = require('./sockets/try-tcp.js');
const winston = require('winston');
const bodyParser = require('body-parser');
const expressWinston = require('express-winston');

const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = (userDataDir) => {

  const name = 'celestron-wifi-tool';
  const expressPort = 3131;

  const userDataFile = "user-data.json";
  // const getStore = async () => JSON.parse(await fs.readFile(path.join(userDataDir, userDataFile), "utf8"));
  const getStore = async (logger) => {
    let storeStr = await fs.readFile(path.join(userDataDir, userDataFile), "utf8");
    logger.info('getStore::' + storeStr);
    return JSON.parse(storeStr);
  };
  // const updateStore = async (newStore) => await fs.writeFile(path.join(userDataDir, userDataFile), JSON.stringify(newStore));
  const updateStore = async (newStore, logger) => {
    let storeStr = JSON.stringify(newStore);
    await fs.writeFile(path.join(userDataDir, userDataFile), storeStr);
    logger.info('updateStore::' + storeStr);
    return newStore;
  };

  const app = express();
  let transactionId = 0;
  const broadcastPort = 55555;


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

  app.use(cors(), (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", '"PUT, GET, POST, DELETE, OPTIONS');
    next();
  })

  app.use(bodyParser.json())

  app.get('/', async (req, res) => {
    let store = await getStore(logger);
    store.sandboxValue++;
    let updatedStore = await updateStore(store, logger);
    res.send('Hello World! -- txnId: (' + JSON.stringify(updatedStore) + "), " + transactionId++);
  })

  app.get('/last-address', async (req, res) => {
    let store = await getStore(logger);
    if (store.lastAddress) {
      res.json({lastAddress: store.lastAddress, transactionId});
    }
    else {
      // res.status(500).send({ error: 'could not find last address in data store' , transactionId });
      res.json({ error: 'could not find last address in data store' , transactionId });
    }
    transactionId++;
  })

  app.post('/last-address', async (req, res) => {
    logger.info('printing req body ' + req.body);
    let store = await getStore(logger);
    if (req.body.address) {
      store['lastAddress'] = req.body.address;
      await updateStore(store, logger);
      res.json({ success: true })
    }
    else {
      res.json({ error: 'Could not find address in req body', transactionId})
    }
    transactionId++;
  })

  app.get('/broadcast', async (req, res) => {
    let broadcastResponse = await tryUdp(broadcastPort);
    if (broadcastResponse.error) {
      // res.status(500).send({ error: broadcastResponse.error , transactionId });
      res.json({ error: broadcastResponse.error , transactionId });
    }
    else {
      res.json({...broadcastResponse, transactionId});
    }
    transactionId++;
  })

  app.get('/connect', async (req, res) => {
    const {ip, port} = req.query;
    let configs = await tryTcp(ip, port);
    if (configs.error) {
      // res.status(500).send({ error: configs.error , transactionId });
      res.json({ error: configs.error , transactionId });
    }
    else {
      res.json({...configs, transactionId});
    }
    transactionId++;
  })

  app.listen(expressPort, () => {
    logger.info(`Example app listening on port ${expressPort}`)
  })

}