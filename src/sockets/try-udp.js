const dgram = require('node:dgram');

// todo - add a timeout
const tryUdp = (broadcastPort, timeout=6000) => {
  return new Promise((resolve, reject) => {
    let moduleConfigs = {};

    const timer = setTimeout(() => {
      reject(new Error('Connection timeout in tryUdp'));
    }, timeout);

    try {
      const client = dgram.createSocket('udp4');

      console.log('listening for udp broadcast: ', JSON.stringify(client));

      client.on('error', error => {
        console.error(`client udp broadcast error: ${error.stack}`);
        clearTimeout(timer);
        reject(error);
        client.close();
      })

      client.on('message', (message, rinfo) => {
        console.log(`client got ${message} from ${rinfo.address}:${rinfo.port}`);
        if (message.includes('Origin')) {
          // handle origin
        }
        else if (message.includes('ZENTRI')) {
          // handle skyportal
          let repsonse = JSON.parse(message);
          moduleConfigs = {...repsonse, ...rinfo};
          console.log('sending to frontend...', moduleConfigs);
          clearTimeout(timer);
          resolve(moduleConfigs);
          client.close();
        }
      })

      client.on('listening', () => {
        const {address, port} = client.address();
        console.log(`client listening on ${address}:${port}`)
      })

      client.bind(broadcastPort);
    }
    catch (error) {
      console.error("In /info -- error was: ", error.message);
      clearTimeout(timer);
      reject(error);
    }
  });
}

module.exports = tryUdp;
