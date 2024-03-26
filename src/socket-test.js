const net = require('node:net');
const dgram = require('node:dgram');
const port = 3000;
const host = '1.2.3.4';

let INPUT_MODES = {
  UNINITIALIZED: -1,
  IDLE: 0,
  GET_VERSION: 1,
  GET_MAC: 2,
}

let INPUT_MODE = INPUT_MODES['UNINITIALIZED'];
let LOG_LEVEL = 2;

const printPacket = (lvl, res, mode, nread) => {
  if (lvl < 2) return;
  res = res.replaceAll('\n', '\\n').replaceAll('\r','\\r');
  console.log(`${host}:${port}::PACKET::(MODE|${mode})[${res}], nread: ${JSON.stringify(nread)}`);
}

const printMessage = (lvl, final, mode) => {
  if (lvl < 1) return
  final = final.replaceAll('\n', '\\n').replaceAll('\r','\\r');
  console.log(`${host}:${port}::MESSAGE::(MODE|${mode})[${final}]`);
}

let resolver, rejecter, timer;
let messageBuffer = [];
const eomToken = '> ';

let lookingForFirstAck = true;
const readPacket = (nread, data) => {
  // convert buffer to string
  const receivedData = data.toString('utf8', 0, nread);
  printPacket(LOG_LEVEL, receivedData, INPUT_MODE, nread);

  if (lookingForFirstAck && receivedData == eomToken) {
    lookingForFirstAck = false;
    return;
  }

  if (receivedData.includes(eomToken)) {
    let bufferedData = messageBuffer.join('');
    messageBuffer = [];

    let subMessages = receivedData.split(eomToken);
    // prepend buffered data
    subMessages[0] = bufferedData + subMessages[0];
    subMessages.forEach((message, idx) => {
      if (idx === (subMessages.length - 1) && message !== '')
        messageBuffer.push(message);
      else if (message !== '') {
        clearTimeout(timer);
        printMessage(LOG_LEVEL, message, INPUT_MODE);
        resolver(message);
      }
    });
  }
  else {
    messageBuffer.push(receivedData);
  }
}

const handleError = (error, mode) => {
  console.log("error occured in mode ", mode);
  clearTimeout(timer);
  rejecter(error);
}

const connect = (timeout) => {
  return new Promise((resolve, reject) => {
    const client = net.createConnection({port, host, onread: {
      buffer: Buffer.alloc(4 * 1024),
    }}, () => {
      clearTimeout(timer);
      resolve(client);
    })

    const timer = setTimeout(() => {
      client.destroy();
      reject(new Error('Connection timeout'));
    }, timeout);
  })
}

const sendAndReceive = (message, timeout=1000) => {
  INPUT_MODE = message.trim();
  return new Promise((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;

    timer = setTimeout(() => {
      client.end();
      reject(new Error(`(${message.trim()})::Failed to receive response before timeout`));
    }, timeout);

    // finally - write message
    setTimeout(() => client.write(message, 'utf8', () => {
      console.log(`${host}:${port}::WRITE[${message.trim()}]`)
    }), 100);
  });
}

let client;
const tryTcp = async () => {
  try {
    client = await connect(3000);
    client.on('data', data => readPacket(data.length, data));
    client.on('error', error => handleError(error, INPUT_MODE));
    console.log('Connected successfully!');

    console.log('attempting a slew of commands...');

    INPUT_MODE = INPUT_MODES["GET_VERSION"];
    const versionReponse = await sendAndReceive('version\r\n');
    console.log('gotVersion: ', versionReponse);

    const moduleConfigs = { };
    const commands = [
      'wlan.mac',
      'wlan.ssid',
      'wlan.passkey',
      'softap.passkey',
      'wlan.static.ip',
      'wlan.static.gateway',
      'wlan.static.netmask',
    ];

    // don't use forEach.. doesn't play well with Promises
    for (const command of commands) {
      const response = await sendAndReceive(`get ${command}\r\n`);
      moduleConfigs[command] = response.trim();
    } 

    console.log(moduleConfigs);

    console.log('waiting 5 seconds before killing connection');
    await sleep(5000);

    client.end();
  }
  catch (error) {
    console.error("In TryTcp --> error was: ", error.message);
  }
}

const tryUdp = async () => {
  try {
    client = dgram.createSocket('udp4');
    let udpPort = 55555;

    client.on('error', (err) => {
      console.error(`client error:\n${err.stack}`);
      client.close();
    });

    client.on('message', (msg, rinfo) => {
      console.log(`client got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    });

    client.on('listening', () => {
      const address = client.address();
      console.log(`client listening ${address.address}:${address.port}`);
    });

    client.bind(udpPort);
  }
  catch (error) {
    console.error("In TryUdp --> error was: ", error.message);
  }
}

/********************
 *  Main Control    *
 ********************/
const programs = {
  "TCP": 0,
  "UDP": 1,
};

const programMode = programs["UDP"];

if (programMode === programs["TCP"]) {
  tryTcp();
}
else if (programMode === programs["UDP"]) {
  tryUdp();
}
const sleep = async (timeout) => await new Promise(resolve => setTimeout(resolve, timeout));