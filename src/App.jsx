import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import wifiTechnology from "../public/wifi-technology.avif";
import InfoSvg from "./components/svg/InfoSvg";
import loadingGif from "../public/loading.gif";
import axios from './api';
import DeviceManager from "./components/DeviceManager";
import TroubleshootingPage from "./components/TroubleshootingPage";
import ReadyPage from "./components/ReadyPage";
import Dialog from "./components/Dialog";
import InfoPage from "./components/InfoPage";

const { ipcRenderer } = window.require('electron');

const testObject = [
  {
    networkName: "ROUTER-5G",
    networkPassphrase: "MyPlaintextPassword",
    moduleName: "FAKE-04C",
    modulePassphrase: "",
  },
    {
    networkName: "Home Router",
    networkPassphrase: "MyPlaintextPassword1",
    moduleName: "Celestron-194",
    modulePassphrase: "",
  },
  {
    networkName: "OfficeWifi",
    networkPassphrase: "MyPlaintextPassword2",
    moduleName: "Celestron-33F",
    modulePassphrase: "",
  }
];

// this is a relic, better extract the useful strings and get rid of the rest
const content = {
  headerText: "Celestron Wifi Password Manager",
  fakeNetworkName: testObject[0].networkName,
  fakeNetworkPassphrase: testObject[0].networkPassphrase,
  fakeModuleName: testObject[0].moduleName,
  fakeModulePassphrase: testObject[0].modulePassphrase,
  sendDeviceInfo: "Configure Wifi Module",
  fakeDeviceStatus: "success",
  deviceStatusSeekingDevices: "SEEKING DEVICES",
};

function App() {
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

  useEffect(() => {
    // handleSeekDevices(); // uncomment to launch app with seek device call
    ipcRenderer.send('react-ready');
  }, []);

  const handleFinalSubmit = async () => {

    setStatus('')
    setStatusMessage('SENDING CONFIGURATIONS');

    const allRefsCurrent = [
      networkSsidRef,
      networkPassphraseRef,
      modulePassphraseRef,
    ].every(ref => ref.current !== undefined && ref.current.value !== undefined)

    if (!allRefsCurrent) {
      setStatus('error');
      setStatusMessage("INTERNAL APPLICATION ERROR, PLEASE TRY AGAIN");
      return;
    }
    if (networkSsidRef.current.value === '') {
      setStatus('warning');
      setStatusMessage("NETWORK SSID NOT AN OPTIONAL FIELD. PLEASE SUPPLY A NETWORK");
      return;
    }
    let formNetworkPassphrase = networkPassphraseRef.current.value;
    if (formNetworkPassphrase !== '' && formNetworkPassphrase.length < 8) {
      setStatus('warning');
      setStatusMessage("NON-EMPTY NETWORK PASSWORD MUST BE AT LEAST 8 CHARACTERS");
      return;
    }
    let formModulePassphrase = modulePassphraseRef.current.value;
    if (formModulePassphrase !== '' && formModulePassphrase.length < 8) {
      setStatus('warning');
      setStatusMessage("NON-EMPTY MODULE PASSWORD MUST BE AT LEAST 8 CHARACTERS");
      return;
    }

    const res = await axios.post('/configure', {
      networkSsid: networkSsidRef.current.value,
      networkPassphrase: networkPassphraseRef.current.value,
      modulePassphrase: modulePassphraseRef.current.value,
    });

    if (res.data.error) {
      console.log('unable to configure the module: ', res.error);
    }
    else {
      console.log('configured module successfully', res);
      setStatusMessage('MODULE CONFIGURED. TOGGLE THE MODE SELECT SWITCH ON YOUR DEVICE');
      setStatus('success');
    }
  }

  const handleSkyportalLinkClick = (e) => {
    e.preventDefault();
    ipcRenderer.send('open-skyportal-manual');
  }
  const handleEvolutionLinkClick = (e) => {
    e.preventDefault();
    ipcRenderer.send('open-evolution-manual');
  }
  const handleCfmLinkClick = (e) => {
    e.preventDefault();
    ipcRenderer.send('open-cfm-download');
  }

  // grabs the last 2 segments of mac address and uses the last 3 digits
  const macAddressToModuleName = (mac) => mac.split(':').slice(-2).join('').slice(-3);

  // main driver of seek devices. attempts to connect to last known ip, then 1.2.3.4
  // failing, those, we attempt to listen for a broadcast from the module and connect wlan
  const handleSeekDevices = async () => {
    setDeviceFound(false);
    setIdle(false);
    setStatus('');
    setStatusMessage(content.deviceStatusSeekingDevices);

    // disable the seek device button while we are seeking
    if (seekDeviceButtonRef.current) {
      console.log('disabling button')
      seekDeviceButtonRef.current.disabled = true;
    }
    
    // reuse this response variable for axios calls (can be refactored)
    let res;

    try {
      // first attempt to get last ip address
      res = await axios.get('/last-address')
      if (res.data.error) {
        console.log('could not obtain last ip-address')
      }
      else {
        // here we've grabbed the last ip address
        setStatusMessage('ATTEMPTING TO CONNECT ON LAST KNOWN IP ADDRESS');
        const lastAddress = res.data.lastAddress;
        console.log('last ip we saw was: ', lastAddress)

        // attempt to connect via that ip address
        res = await axios.get('/connect', {
          params: {
            ip: res.data.lastAddress,
            port: '3000',
          }
        })
        if (res.data.error) {
          console.log('unable to connect to ', lastAddress);
        }
        else {
          // we've successfully established a connection with our last known ip address
          console.log('response to last ip res was: ', res);

          // set state and return from the event handler
          setNetworkName(res.data['wlan.ssid']);
          setNetworkPassphrase(res.data['wlan.passkey']);
          setModuleName(`Celestron-${macAddressToModuleName(res.data['wlan.mac'])}`);
          setModulePassphrase(res.data['softap.passkey']);
          setStatus('success');
          setStatusMessage('MODULE FOUND');
          setDeviceFound(true);

          // check to see if we can modify passphrase
          if (res.data['canOverrideModulePassphrase'])
            setCanOverrideModulePassphrase(true);

          // reenable seek devices button
          if (seekDeviceButtonRef.current) {
            console.log('reenabling button')
            seekDeviceButtonRef.current.disabled = false;
          }

          return;
        }

        // we only arrive here if we weren't successful using previous ip address,
        // attempt to connect to 1.2.3.4 (assuming 1.2.3.4 wasn't our previous ip address)
        if (lastAddress !== '1.2.3.4') {
          setStatusMessage('ATTEMPTING TO CONNECT VIA DIRECT CONNECT');
          res = await axios.get('/connect', {
            params: {
              ip: '1.2.3.4',
              port: '3000',
            }
          })
          if (res.data.error) {
            console.log('unable to connect to 1.2.3.4');
          }
          else {
            console.log('response to direct connect (1.2.3.4) res was: ', res);

            // update device manager forms with relevant data
            setNetworkName(res.data['wlan.ssid']);
            setNetworkPassphrase(res.data['wlan.passkey']);
            setModuleName(`Celestron-${macAddressToModuleName(res.data['wlan.mac'])}`);
            setModulePassphrase(res.data['softap.passkey']);
            setStatus('success');
            setStatusMessage('MODULE FOUND');
            setDeviceFound(true);

            if (res.data['canOverrideModulePassphrase'])
              setCanOverrideModulePassphrase(true);

            // since we found module on 1.2.3.4, save as our last known ip address
            let updateLastIpRes = await axios.post('/last-address', {
              address: '1.2.3.4',
            });
            console.log('post express/last-address returns ' , updateLastIpRes.data);

            // reenable seek devices button
            if (seekDeviceButtonRef.current) {
              console.log('reenabling button')
              seekDeviceButtonRef.current.disabled = false;
            }
            return;
          }
        }
        else {
          console.log('skipping DC follow up connect attempt since our last known ip was 1.2.3.4')
        }
      }

      // if all prior tcp connection attempts fail, attempt to get a broadcast response
      setStatusMessage('ATTEMPTING TO FIND DEVICES ON THE NETWORK');
      let broadcast = await axios.get('/broadcast');
      console.log(`express/broadcast gets`, broadcast.data);

      if (broadcast.data.error || broadcast.data.address === undefined) { // we can probably remove the undefined check, check prev console log
        // unable to find broadcast signal, failure...
        console.log("unable to find _any_ signal... cannot proceed");
        console.log("MAKE SURE YOU ARE CONNECTED TO THE SAME WIFI :)")
        setStatus('error')
        setStatusMessage('UNABLE TO FIND WIFI MODULES ON WLAN');
      }
      else {
        // take response from broadcast and attempt to connect
        let port = '3000';
        res = await axios.get(`/connect`, {
          params: {
            ip: broadcast.data.address,
            port: port,
          }
        });
        console.log(`express/connect @ ${broadcast.data.address}:${port}`, res.data);

        if (res.data.error) {
          // unable to connect to the broadcast's ip address (maybe try a different port)
          console.log('no response attempting to talk to broadcasted ip address... cannot proceed')
          setStatus('error')
          setStatusMessage('UNABLE TO CONNECT TO MODULES VIA WLAN');
        }
        else {
          setNetworkName(res.data['wlan.ssid']);
          setNetworkPassphrase(res.data['wlan.passkey']);
          setModuleName(`Celestron-${macAddressToModuleName(res.data['wlan.mac'])}`);
          setModulePassphrase(res.data['softap.passkey']);
          setStatus('success');
          setStatusMessage('MODULE FOUND');
          setDeviceFound(true);

          if (res.data['canOverrideModulePassphrase'])
            setCanOverrideModulePassphrase(true);

          // since we found an ip address, save it...
          let updateLastIpRes = await axios.post('/last-address', {
            address: broadcast.data.address,
          });

          console.log('post express/last-address returns ' , updateLastIpRes.data);

          // reenable seek devices button
          if (seekDeviceButtonRef.current) {
            console.log('reenabling button')
            seekDeviceButtonRef.current.disabled = false;
          }
          return;
        }
      }
    }
    catch(error) {
      console.log('Unable to communicate with backend... attempt to reset the app');
      setStatusMessage('UNEXPECTED ERROR. PLEASE RESTART APPLICATION');
      setStatus('error');
    }

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
        <InfoPage
          handleClose={() => setModalOpen(false)}
          handleSkyportalLinkClick={handleSkyportalLinkClick}
          handleEvolutionLinkClick={handleEvolutionLinkClick}
          handleCfmLinkClick={handleCfmLinkClick}
         />
      </Dialog>
      <div id="navbar" className="celestron-background">
        <div className="navbar-item">
          <img className="celestron-icon-small" src={wifiTechnology} alt="Celestron Icon Small" />
        </div>
        <div className="navbar-item navbar-title">
          {content.headerText}
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

export default App;