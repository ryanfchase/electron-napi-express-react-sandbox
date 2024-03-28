const net = require('node:net');
const acceptedModules = require('../../config/accepted-modules.json');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'verbose',
  format: winston.format.json(),
  // defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.Console()
  ]
})

let INPUT_MODE = 'uninitialized';
let lookingForFirstAck = true;
let resolver, rejecter, timer;
let messageBuffer = [];
let _host = '';
let _port = '';
const eomToken = '> ';

const initialize = () => {
  INPUT_MODE = 'uninitialized';
  lookingForFirstAck = true;
  resolver = null;
  rejecter = null;
  timer = null;
  messageBuffer = [];
  _host = '';
  _port = '';
}

const printPacket = (res, mode, nread) => {
  res = res.replaceAll('\n', '\\n').replaceAll('\r','\\r');
  logger.verbose(`${_host}:${_port}::PACKET::(MODE|${mode})[${res}], nread: ${JSON.stringify(nread)}`);
}

const printMessage = (final, mode) => {
  final = final.replaceAll('\n', '\\n').replaceAll('\r','\\r');
  logger.verbose(`${_host}:${_port}::MESSAGE::(MODE|${mode})[${final}]`);
}

const printWrite = (final, mode) => {
  final = final.replaceAll('\n', '\\n').replaceAll('\r','\\r');
  logger.verbose(`${_host}:${_port}::WRITE::(MODE|${mode})[${final}]`);
}

const readPacket = (nread, data) => {
  // convert buffer to string
  const receivedData = data.toString('utf8', 0, nread);
  printPacket(receivedData, INPUT_MODE, nread);

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
        printMessage(message, INPUT_MODE);
        resolver(message);
      }
    });
  }
  else {
    messageBuffer.push(receivedData);
  }
}

const handleError = (error, mode) => {
  logger.warn("error occured in mode " + mode);
  clearTimeout(timer);
  rejecter(error);
}

const connect = (host, port, timeout) => {
  return new Promise((resolve, reject) => {
    const client = net.createConnection({port, host, onread: {
      buffer: Buffer.alloc(4 * 1024),
    }}, () => {
      _host = host;
      _port = port;
      clearTimeout(timer);
      resolve(client);
    })

    const timer = setTimeout(() => {
      client.destroy();
      reject(new Error('Timed out while attempting to establish a TCP connection to module'));
    }, timeout);
  })
}

const sendAndReceive = (client, message, timeout=1000) => {
  return new Promise((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;

    timer = setTimeout(() => {
      client.end();
      reject(new Error(`(${message.trim()})::Failed to receive response before timeout`));
    }, timeout);

    // finally - write message
    setTimeout(() => client.write(message, 'utf8', () => {
      printWrite(message, INPUT_MODE);
    }), 100);
  });
}

const tryTcp = async (host, port, commands, mode, timeoutConnect=3000, timeoutRequest=3000) => {
  let moduleConfigs = {};
  initialize();

  if (mode !== 'get' && mode !== 'set') {
    moduleConfigs['error'] = 'Developer error -- must use "get" or "set" with TCP commands';
    return moduleConfigs;
  }

  try {
    logger.verbose('in tcp with ' + JSON.stringify({host, port, mode, commands}));
    const client = await connect(host, port, timeoutConnect);
    client.on('data', data => readPacket(data.length, data));
    client.on('error', error => handleError(error, INPUT_MODE));

    INPUT_MODE = 'version';
    moduleConfigs['version'] = await sendAndReceive(client, 'version\r\n');

    // don't use forEach.. doesn't play well with Promises
    for (const {name, arg} of commands) {
      INPUT_MODE = name.trim();
      const argString = (arg !== undefined) ? ` \"${arg}\"` : '';
      const response = await sendAndReceive(client, `${mode} ${name}${argString}\r\n`, timeoutRequest);
      moduleConfigs[name] = response.trim();
    } 

    // if we were setting configurations, send a 'save' command
    if (mode === 'set') {
      const saved = await sendAndReceive(client, "save\r\n", timeoutRequest);
      moduleConfigs['save'] = saved;
    }

    client.end();
  }
  catch (error) {
    logger.warn("In TryTcp --> error was: " + error.message);
    moduleConfigs['error'] = error.message;
  }

  return moduleConfigs;
}

module.exports = tryTcp;