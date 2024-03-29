const express = require('express');
const cors = require('cors');
const tryUdp = require('./sockets/try-udp.js');
const tryTcp = require('./sockets/try-tcp.js');
const winston = require('winston');
const bodyParser = require('body-parser');
const expressWinston = require('express-winston');

const fs = require('node:fs/promises');
const path = require('node:path');
const { hostname } = require('node:os');

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

  app.get('/', (req, res) => {
    res.send('Hello World! -- txnId: (' + JSON.stringify(updatedStore) + "), " + transactionId++);
  })

  app.get('/last-address', async (req, res) => {
    try {
      let store = await getStore(logger);
      if (store.lastAddress) {
        res.json({lastAddress: store.lastAddress, transactionId});
      }
      else {
        res.json({ error: 'could not find last address in data store' , transactionId });
      }
    }
    catch (error) {
      logger.warn(`exception caught in POST /last-address with req.body.address ${req.body.address} :: ${JSON.stringify(error)}`)
      res.json({ error: 'could not find last address in data store', transactionId });
    }
    transactionId++;
  })

  app.post('/last-address', async (req, res) => {
    logger.info('printing req body ' + req.body);
    try {
      let store = await getStore(logger);
      if (req.body.address) {
        store['lastAddress'] = req.body.address;
        await updateStore(store, logger);
        res.json({ success: true })
      }
      else {
        res.json({ error: 'Could not find address in req body', transactionId})
      }
    }
    catch (error) {
      logger.warn(`exception caught in POST /last-address with req.body.address ${req.body.address} :: ${JSON.stringify(error)}`)
      res.json({ error: 'Could not update address in req body', transactionId });
    }
    transactionId++;
  })

  app.get('/broadcast', async (req, res) => {
    try {
      let broadcastResponse = await tryUdp(broadcastPort);
      if (broadcastResponse.error) {
        // res.status(500).send({ error: broadcastResponse.error , transactionId });
        res.json({ error: broadcastResponse.error , transactionId });
      }
      else {
        res.json({...broadcastResponse, transactionId});
      }
    }
    catch(error) {
      logger.warn(`exception caught in /broadcast @ on ${broadcastPort}: ${JSON.stringify(error)}`)
      res.json({error: error.message, transactionId});
    }
    transactionId++;
  })

  app.get('/connect', async (req, res) => {
    const {ip, port} = req.query;
    const commandList = [
      { name: 'wlan.mac' },
      { name: 'wlan.ssid' },
      { name: 'wlan.passkey' },
      { name: 'softap.passkey' },
      { name: 'wlan.static.ip' },
      { name: 'wlan.static.gateway' },
      { name: 'wlan.static.netmask' },
    ]
    try {
      let moduleResponse = await tryTcp(ip, port, commandList, 'get');
      logger.verbose(`in /connect @ ${ip}:${port}, moduleResponse was: ${JSON.stringify(moduleResponse)}`);
      if (moduleResponse.error) {
        // res.status(500).send({ error: configs.error , transactionId });
        res.json({ error: moduleResponse.error , transactionId });
      }
      else {
        res.json({...moduleResponse, transactionId});
      }
    }
    catch(error) {
      logger.warn(`exception caught in /connect @ ${ip}:${port}: ${JSON.stringify(error)}`)
      res.json({error: error.message, transactionId})
    }
    transactionId++;
  })

  app.post('/configure', async(req, res) => {
    let store = await getStore(logger);
    let port = 3000;

    const {
      networkSsid,
      networkPassphrase,
      modulePassphrase
    } = req.body;
    logger.info('express @ /configure received body: ' + req.body);
    logger.info('express @ /configure received lastA: ' + req.body);

    const commandList = [
      { name: 'wlan.ssid', arg: networkSsid },
      { name: 'wlan.passkey', arg: networkPassphrase },
      { name: 'softap.passkey', arg: modulePassphrase },
      { name: 'wlan.dhcp.enabled', arg: "1" },
      { name: 'wlan.static.ip', arg: "0.0.0.0" },
      { name: 'wlan.static.gateway', arg: "0.0.0.0" },
      { name: 'wlan.static.netmask', arg: "0.0.0.0" },
    ]

    try {
      let moduleResponse = await tryTcp(store.lastAddress, port, commandList, 'set');
      if (moduleResponse.error) {
        res.json({ error: moduleResponse.error, transactionId});
      }
      else {
        res.json({...moduleResponse, transactionId });
      }
    }
    catch (error) {
      logger.warn(`exception caught in /configure: ${JSON.stringify(error)}`)
      res.json({error: error.message, transactionId})
    }
    transactionId++;
  })

  app.listen(expressPort, () => {
    logger.info(`Example app listening on port ${expressPort}`)
  })

}