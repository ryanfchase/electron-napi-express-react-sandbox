const dgram = require('node:dgram');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
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

    const timer = setTimeout(() => {
      reject(new Error('Connection timeout in tryUdp'));
    }, timeout);

    try {
      const client = dgram.createSocket('udp4');

      logger.verbose('listening for udp broadcast: ', JSON.stringify(client));

      client.on('error', error => {
        logger.warn(`client udp broadcast error: ${error.stack}`);
        clearTimeout(timer);
        reject(error);
        client.close();
      })

      client.on('message', (message, rinfo) => {
        logger.verbose(`client got ${message} from ${rinfo.address}:${rinfo.port}`);
        if (message.includes('Origin')) {
          // handle origin
        }
        else if (message.includes('ZENTRI')) {
          // handle skyportal
          let repsonse = JSON.parse(message);
          moduleConfigs = {...repsonse, ...rinfo};
          logger.verbose('response from broadcast: ', moduleConfigs);
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
      logger.warn("In /info -- error was: ", error.message);
      clearTimeout(timer);
      reject(error);
    }
  });
}

module.exports = tryUdp;
