const dgram = require('node:dgram');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'verbose',
  format: winston.format.json(),
  // defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.Console()
  ]
})

const acceptedModules = require('../../config/accepted-modules.json');

const tryUdp = (broadcastPort, timeout=6000) => {
  return new Promise((resolve, reject) => {
    let moduleConfigs = {};
    const client = dgram.createSocket('udp4');


    const timer = setTimeout(() => {
      logger.verbose(`connection timed out while establish UDP connection to port=${broadcastPort}`);
      client?.close();
      reject({ message: 'connection timed out while connecting via udp, could not detect broadcast' }); // package as { error: { message: '... }}
    }, timeout);

    try {
      logger.verbose('listening for udp broadcast: ' + JSON.stringify(client));

      client.on('error', error => {
        logger.warn(`client udp broadcast error via port=${broadcastPort}`);
        clearTimeout(timer);
        reject({message: error.message}); // package as { error: { message: '... }}
        client.close();
      })

      client.on('message', (message, rinfo) => {
        logger.verbose(`client got ${message} from ${rinfo.address}:${rinfo.port}`);
        if (message.includes('Origin')) {
          // handle origin
        }
        else if (message.includes('AMW007')) {
          // handle skyportal
          let repsonse = JSON.parse(message);
          moduleConfigs = {...repsonse, ...rinfo};
          logger.verbose('response from broadcast: ' + moduleConfigs);
          clearTimeout(timer);
          resolve(moduleConfigs);
          client.close();
        }
      })

      client.on('listening', () => {
        const {address, port} = client.address();
        logger.verbose(`client listening on ${address}:${port}`)
      })

      client.bind(broadcastPort);
    }
    catch (error) {
      logger.warn("In tryUdp -- error was: " + error.message);
      clearTimeout(timer);
      reject({message: error.message}); // package as { error: { message: '... }}
      client?.close();
    }
  });
}

module.exports = tryUdp;
