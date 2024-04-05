import connectionHelper from "../../util/connectionHelper";
import { DIRECT_CONNECT_IP, STATUS_MESSAGES, STATUSES, CONTROL_FLOWS } from "./constants";

const seekDevices = async (setStatus, setStatusMessage, setModule) => {
    let controlFlowState = CONTROL_FLOWS['LOAD_LAST_ADDRESS'];

    // reusable variables for responses to connectionHelper
    let error, data, lastAddress, broadcastAddress;
    let shouldContinue = true;
    while (shouldContinue) {
      try {
        switch(controlFlowState) {

          case CONTROL_FLOWS['LOAD_LAST_ADDRESS']:
            // attempt to load last ip address from file
            ({ error, lastAddress} = await connectionHelper.getLastAddress());
            
            if (error || lastAddress === DIRECT_CONNECT_IP) {
              controlFlowState = CONTROL_FLOWS['CONN_DIRECT_CONNECT'];
            }
            else {
              controlFlowState = CONTROL_FLOWS['CONN_LAST_ADDRESS'];
            }
            break;
          case CONTROL_FLOWS['CONN_LAST_ADDRESS']:
            // attempt to connect on the last known ip address
            if (lastAddress && lastAddress !== '') {
              setStatusMessage(STATUS_MESSAGES.attemptingLastIp);
              ({ error, data } = await connectionHelper.attemptConnect(lastAddress, 3000)); // consider additionally checking port 2000

              if (error) {
                controlFlowState = CONTROL_FLOWS['CONN_DIRECT_CONNECT'];
              }
              else {
                controlFlowState = CONTROL_FLOWS['MODULE_FOUND'];
              }
            }
            break;
          case CONTROL_FLOWS['CONN_DIRECT_CONNECT']:
            // attempt to connect via 1.2.3.4 (we previously confirmed last ip was not 1.2.3.4)
            setStatusMessage(STATUS_MESSAGES.attemptingDirectConnect);
            ({ error, data } = await connectionHelper.attemptConnect(DIRECT_CONNECT_IP, 3000));

            if (error) {
              controlFlowState = CONTROL_FLOWS['CONN_BROADCAST'];
            }
            else {
              controlFlowState = CONTROL_FLOWS['MODULE_FOUND'];
            }
            break;
          case CONTROL_FLOWS['CONN_BROADCAST']:
            setStatusMessage(STATUS_MESSAGES.attemptingBroadcast);
            ({ error, broadcastAddress} = await connectionHelper.listenBroadcast());

            if (error) {
              setStatus(STATUSES.error);
              setStatusMessage(STATUS_MESSAGES.unableToFindBroadcast);
              controlFlowState = CONTROL_FLOWS['MODULE_NOT_FOUND'];
            }
            else {
              controlFlowState = CONTROL_FLOWS['CONN_WLAN'];
            }
            break;
          case CONTROL_FLOWS['CONN_WLAN']:
            if (broadcastAddress && broadcastAddress !== '') {
              setStatusMessage(STATUS_MESSAGES.attemptingWlan);
              ({ error, data } = await connectionHelper.attemptConnect(broadcastAddress, 3000));

              if (error) {
                setStatus(STATUSES.error);
                setStatusMessage(STATUS_MESSAGES.unableToConnectWlan);
                controlFlowState = CONTROL_FLOWS['MODULE_NOT_FOUND'];
              }
              else {
                await connectionHelper.updateLastAddress(broadcastAddress);
                controlFlowState = CONTROL_FLOWS['MODULE_FOUND'];
              }
            }
            break;
          case CONTROL_FLOWS['MODULE_FOUND']:
            if (data) {
              setModule(data);
            }
            shouldContinue = false;
            break;
          case CONTROL_FLOWS['MODULE_NOT_FOUND']:
            shouldContinue = false;
            break;
          default:
            console.log("In SeekDevices while loop, arrived at a bad state: ", controlFlowState);
            setStatusMessage(STATUS_MESSAGES.fatalError);
            setStatus(STATUSES.error);
            shouldContinue = false;
            break;
        }
      }
      catch(error) {
        console.error(error);
        setStatusMessage(STATUS_MESSAGES.fatalError);
        setStatus(STATUSES.error);
        shouldContinue = false;
      }
    }

}

export default seekDevices;