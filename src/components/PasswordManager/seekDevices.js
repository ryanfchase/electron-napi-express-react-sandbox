  import connectionHelper from "../../util/connectionHelper";

  const DIRECT_CONNECT_IP = '1.2.3.4';
  const statusMessages = {
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
  const statuses = {
    success: 'success',
    error: 'error',
  };

  const controlFlows = {
    LOAD_LAST_ADDRESS: 0,
    CONN_LAST_ADDRESS: 1,
    CONN_DIRECT_CONNECT: 2,
    CONN_BROADCAST: 3,
    CONN_WLAN: 4,
    MODULE_FOUND: 5,
    MODULE_NOT_FOUND: 6,
  }
const seekDevices = async (setStatus, setStatusMessage, setModule) => {
    let controlFlowState = controlFlows['LOAD_LAST_ADDRESS'];

    let error, data, lastAddress, broadcastAddress;
    let shouldContinue = true;
    while (shouldContinue) {
      try {
        switch(controlFlowState) {

          case controlFlows['LOAD_LAST_ADDRESS']:
            // attempt to load last ip address from file
            ({ error, lastAddress} = await connectionHelper.getLastAddress());
            
            if (error || lastAddress === DIRECT_CONNECT_IP) {
              controlFlowState = controlFlows['CONN_DIRECT_CONNECT'];
            }
            else {
              controlFlowState = controlFlows['CONN_LAST_ADDRESS'];
            }
            break;
          case controlFlows['CONN_LAST_ADDRESS']:
            // attempt to connect on the last known ip address
            if (lastAddress && lastAddress !== '') {
              setStatusMessage(statusMessages.attemptingLastIp);
              ({ error, data } = await connectionHelper.attemptConnect(lastAddress, 3000)); // consider additionally checking port 2000

              if (error) {
                controlFlowState = controlFlows['CONN_DIRECT_CONNECT'];
              }
              else {
                controlFlowState = controlFlows['MODULE_FOUND'];
              }
            }
            break;
          case controlFlows['CONN_DIRECT_CONNECT']:
            // attempt to connect via 1.2.3.4 (we previously confirmed last ip was not 1.2.3.4)
            setStatusMessage(statusMessages.attemptingDirectConnect);
            ({ error, data } = await connectionHelper.attemptConnect(DIRECT_CONNECT_IP, 3000));

            if (error) {
              controlFlowState = controlFlows['CONN_BROADCAST'];
            }
            else {
              controlFlowState = controlFlows['MODULE_FOUND'];
            }
            break;
          case controlFlows['CONN_BROADCAST']:
            setStatusMessage(statusMessages.attemptingBroadcast);
            ({ error, broadcastAddress} = await connectionHelper.listenBroadcast());

            if (error) {
              setStatus(statuses.error);
              setStatusMessage(statusMessages.unableToFindBroadcast);
              shouldContinue = false;
            }
            else {
              controlFlowState = controlFlows['CONN_WLAN'];
            }
            break;
          case controlFlows['CONN_WLAN']:
            if (broadcastAddress && broadcastAddress !== '') {
              setStatusMessage(statusMessages.attemptingWlan);
              ({ error, data } = await connectionHelper.attemptConnect(broadcastAddress, 3000));

              if (error) {
                setStatus(statuses.error);
                setStatusMessage(statusMessages.unableToConnectWlan);
                shouldContinue = false;
              }
              else {
                await connectionHelper.updateLastAddress(broadcastAddress);
                controlFlowState = controlFlows['MODULE_FOUND'];
              }
            }
            break;
          case controlFlows['MODULE_FOUND']:
            if (data) {
              setModule(data);
            }

            shouldContinue = false;
            break;
          case controlFlows['MODULE_NOT_FOUND']:
            shouldContinue = false;
            break;
          default:
            console.log("In SeekDevices while loop, arrived at a bad state: ", controlFlowState);
            setStatusMessage(statusMessages.fatalError);
            setStatus(statuses.error);
            shouldContinue = false;
            break;
        }
        console.log("END OF SWITCH -- INSIDE WHILE: ", controlFlowState)
      }
      catch(error) {
        console.error(error);
        setStatusMessage(statusMessages.fatalError);
        setStatus(statuses.error);
        shouldContinue = false;
      }
    }

}

export default seekDevices;