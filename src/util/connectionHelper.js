import api from "./api";
/*
 * All methods in connectionHelper will return a javascript object.
 * The object will be EITHER { error }, or { xyz }, allowing
 * consumers of this api to run
 * `if (response.error) ... dont bother with response.xyz ...
 */

/* Attempt to obtain the user's last known ip-address (saved as a file) */
const getLastAddress = async () => {
  const res = await api.get('/last-address')
  if (res.data.error) {
    console.log('getLastAddress::could not obtain last ip-address');
    return { error: res.data.error };
  }
  if (res.data.lastAddress) {
    // todo - verify ip address format
    console.log('getLastAddress::last ip-address was ', res.data.lastAddress);
  }
  return { lastAddress: res.data.lastAddress };
}

// attempt to establish a TCP connection to a socket on the specified ip and port
// Note: this api call does not actually establish the TCP connection, the backend
// runs `try-tcp.js`, which also obtains wifi module device details
const attemptConnect = async (ip, port) => {
  const res = await api.get('/connect', {
    params: { ip, port }
  })
  if (res.data.error) {
    console.log(`attemptConnect::unable to connect to ${ip}:${port}`);
    return { error: res.data.error };
  }
  
  // add or remove terms here while working on tryTcp.js
  const requiredTerms = [
    'wlan.ssid',
    'wlan.passkey',
    'wlan.mac',
    'softap.passkey',
    'canOverrideModulePassphrase'
  ];

  // if any terms are missing, log it to the console for now
  requiredTerms.forEach(term => {
    if (res.data[term] === undefined) console.log('attemptConnect::missing term: ', term);
  })

  // return data, fingers crossed none of these fields are actually empty
  return {
    data: {
      networkName: res.data['wlan.ssid'],
      networkPassphrase: res.data['wlan.passkey'],
      macAddress: res.data['wlan.mac'],
      modulePassphrase: res.data['softap.passkey'],
      canOverrideModulePassphrase: res.data['canOverrideModulePassphrase']
    },
  }
}

// attempt to listen to UDP broadcast, returning connection details from the first
// celestron wifi device.
// Note: this api call does not actually listen to the broadcast, the backend will run
// try-udp.js, this api call simply waits for the response from the backend
const listenBroadcast = async () => {
  const res = await api.get('/broadcast');
  if (res.data.error) {
    console.log("attemptBroadcast:: unable to acquire wifi module on broadcast");
    return { error: res.data.error };
  }
  else if (res.data.address === undefined) {
    return { error: { message: 'unable to acquire wifi module on broadcast' } };
  }

  console.log("listenBroadcast::found broadcast signal: ", res.data.address);

  return {
    broadcastAddress: res.data.address,
  }
}

const updateLastAddress = async (ip) => {
  const res = await api.post('/last-address', {
    address: ip,
  });

  if (res.data.error) {
    console.log('updateLastAddress::encountered error while attempting to update', res.data.error);
    return { error: res.data.error };
  }

  console.log('updateLastAddress::operation success', res.data);
  return { updateSuccess: true };
}

// attempt to establish a TCP connection to wifi module and update the specified
// fields.
// Note: this api call does not actually establish the TCP connection, the backend
// runs `try-tcp.js`, which also configures the wifi module device
const configureModule = async (ssid, passphrase, modulePassphrase) => {
  const res = await api.post('/configure', {
    networkSsid: ssid,
    networkPassphrase: passphrase,
    modulePassphrase: modulePassphrase,
  });

  if (res.data.error) {
    console.log('configureModule:: error -- unable to configure module: ', res.data.error)
    return { error: res.data.error };
  }

  console.log("configureModule::operation success: ", res.data);
  return { configureSuccess: true };
}

export default {
  getLastAddress,
  attemptConnect,
  listenBroadcast,
  updateLastAddress,
  configureModule
};