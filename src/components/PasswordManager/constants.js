
export const DIRECT_CONNECT_IP = '1.2.3.4';
export const STATUS_MESSAGES = {
  seekingDevices: 'SEEKING DEVICES',
  attemptingLastIp: 'ATTEMPTING TO CONNECT ON LAST KNOWN IP ADDRESS',
  attemptingDirectConnect: 'ATTEMPTING TO CONNECT VIA DIRECT CONNECT',
  attemptingBroadcast: 'ATTEMPTING TO FIND DEVICES ON THE NETWORK',
  attemptingWlan: 'BROADCAST SIGNAL FOUND, ATTEMPTING TO CONNECT',
  unableToFindBroadcast: 'UNABLE TO FIND WIFI MODULES ON WLAN',
  unableToConnectWlan: 'UNABLE TO CONNECT TO MODULES ON WLAN',
  moduleFound: 'MODULE FOUND',
  fatalError: 'FATAL ERROR. PLEASE RESTART APPLICATION',
};
export const STATUSES = {
  success: 'success',
  error: 'error',
  warning: 'warning',
};

export const CONTROL_FLOWS = {
  LOAD_LAST_ADDRESS: 0,
  CONN_LAST_ADDRESS: 1,
  CONN_DIRECT_CONNECT: 2,
  CONN_BROADCAST: 3,
  CONN_WLAN: 4,
  MODULE_FOUND: 5,
  MODULE_NOT_FOUND: 6,
};