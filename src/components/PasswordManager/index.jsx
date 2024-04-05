import React, { useState, useEffect, useRef } from "react";
import "./index.css";
import wifiTechnology from "../../../public/wifi-technology.avif";
import InfoSvg from "../svg/InfoSvg";
import loadingGif from "../../../public/loading.gif";
import DeviceManager from "../DeviceManager";
import TroubleshootingPage from "../TroubleshootingPage";
import ReadyPage from "../ReadyPage";
import Dialog from "../Dialog";
import InfoPage from "../InfoPage";
import { signalReactReady } from "../../util/ipc";
import seekDevices from "./seekDevices";
import { verifyRefs, sendConfiguration } from "./sendConfiguration";

function PasswordManager() {
  const [networkName, setNetworkName] = useState('');
  const [networkPassphrase, setNetworkPassphrase] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [modulePassphrase, setModulePassphrase] = useState('');
  const [status, setStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('READY')
  const [deviceFound, setDeviceFound] = useState(false);
  const [canOverrideModulePassphrase, setCanOverrideModulePassphrase] = useState(false);
  const [idle, setIdle] = useState(true);
  const [modalOpen, setModalOpen] = useState(true);

  const networkSsidRef = useRef(null);
  const networkPassphraseRef = useRef(null);
  const moduleSsidRef = useRef(null);
  const modulePassphraseRef = useRef(null);
  const seekDeviceButtonRef = useRef(null);

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

  useEffect(() => {
    // this lifecycle hook runs when components have mounted, signal main to close splash page
    signalReactReady();
  }, []);

  const handleFinalSubmit = async () => {

    setStatus('')
    setStatusMessage('SENDING CONFIGURATIONS');

    await verifyRefs(
      networkSsidRef,
      networkPassphraseRef,
      modulePassphraseRef,
      setStatus,
      setStatusMessage
    );


    await sendConfiguration(
      networkSsidRef,
      networkPassphraseRef,
      modulePassphraseRef,
      setStatus,
      setStatusMessage
    );

  }

  // grabs the last 2 segments of mac address and uses the last 3 digits
  const macAddressToModuleName = (mac) => mac.split(':').slice(-2).join('').slice(-3);

  // main driver of seek devices. attempts to connect to last known ip, then 1.2.3.4
  // failing, those, we attempt to listen for a broadcast from the module and connect wlan
  const handleSeekDevices = async () => {
    setDeviceFound(false);
    setIdle(false);
    setStatus('');
    setStatusMessage(statusMessages.seekingDevices);

    // disable the seek device button while we are seeking
    if (seekDeviceButtonRef.current) {
      console.log('disabling button')
      seekDeviceButtonRef.current.disabled = true;
    }
    
    await seekDevices(setStatus, setStatusMessage, (data) => {
      // on module found....
      setNetworkName(data.networkName);
      setNetworkPassphrase(data.networkPassphrase);
      setModuleName(`Celestron-${macAddressToModuleName(data.macAddress)}`);
      setModulePassphrase(data.modulePassphrase);
      setStatus(statuses.success);
      setStatusMessage(statusMessages.moduleFound);
      setDeviceFound(true);

      // check to see if we can modify passphrase (e.g. AMW007)
      if (data.canOverrideModulePassphrase) {
        setCanOverrideModulePassphrase(true);
      }
    })
    
    // reenable seek devices button
    if (seekDeviceButtonRef.current) {
      seekDeviceButtonRef.current.disabled = false;
    }
  }

  // package state up into a data structure to pass into CredentialsTable
  const credentialsList = [
    {
      formName: "network",
      ssidRef: networkSsidRef,
      passphraseRef: networkPassphraseRef,
      defaultName: networkName,
      defaultPassphrase: networkPassphrase,
      passphraseReadOnly: false,
    },
    {
      formName: "direct connect",
      ssidRef: moduleSsidRef,
      passphraseRef: modulePassphraseRef,
      defaultName: moduleName,
      defaultPassphrase: modulePassphrase,
      passphraseReadOnly: !(canOverrideModulePassphrase),
    }
  ];

  // conditionally render the page's contents based on state
  let mainPageContent;
  if (idle) {
    mainPageContent = (
      <ReadyPage />
    );
  }
  else if (deviceFound) {
    mainPageContent = (
      <DeviceManager
        credentials={credentialsList}
        moduleName={moduleName}
        handleFinalSubmit={handleFinalSubmit}/>);
  }
  else if (status === 'error') {
    mainPageContent = (
      <TroubleshootingPage/>);
  }
  else {
    mainPageContent = (
      <div className="loading-gif-container">
        <img className="loading-gif" src={loadingGif} alt="loading-devices"/>
      </div>);
  }

  return (
    <div id="inner-container">
      <Dialog
        isOpen={modalOpen}
        hasCloseListeners={true}
        onClose={() => setModalOpen(false)}
      >
        <InfoPage handleClose={() => setModalOpen(false)} />
      </Dialog>
      <div id="navbar" className="celestron-background">
        <div className="navbar-item">
          <img className="celestron-icon-small" src={wifiTechnology} alt="Celestron Icon Small" />
        </div>
        <div className="navbar-item navbar-title">
          Celestron Wifi Password Manager
        </div>
        <div className="navbar-item navbar-info">
          <div className="celestron-icon-small">
            <div className="clickable-icon" onClick={() => setModalOpen(true)}>
              <InfoSvg size={48} scale={0.50} fill="grey"/>
            </div>
          </div>
        </div>
      </div>
      <div id="wifi-tool-control-bar" className="celestron-background">
        <div className="centered-controls">
          <button ref={seekDeviceButtonRef} className="celestron-control-button" onClick={handleSeekDevices}>Seek Devices</button>
          <div className={`pre-container ${status}`}>
            <code>
              {statusMessage}
            </code>
          </div>
        </div>
      </div>
      <div id="wifi-device-details">
        { mainPageContent }
      </div>
    </div>
  );
}

export default PasswordManager;