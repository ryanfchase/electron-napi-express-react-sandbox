import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import wifiTechnology from "../public/wifi-technology.avif";
import Warning from "./components/svg/Warning";
import InfoSvg from "./components/svg/InfoSvg";
import loadingGif from "../public/loading.gif";
import Banner from "../public/celestron-big.webp"
import axios from './api';
import DeviceManager from "./components/DeviceManager";
import TroubleshootingPage from "./components/TroubleshootingPage";
import ReadyPage from "./components/ReadyPage";
import Dialog from "./components/Dialog";

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
      setStatusMessage('MODULE CONFIGURED');
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
        <div>
          <div className="dialog-header">
            <span>About This Application</span>
            <span className="dialog-close-button" onClick={() => setModalOpen(false)}>X</span>
          </div>
          <hr></hr>
          <div className="dialog-banner" >
            <img src={Banner} alt="celestron-banner"/>
          </div>
          <div className="dialog-contents-container">
            <p>The Celestron Wifi Password Manager is a tool that lets you configure network settings for your Celestron wifi accessories and wifi-enabled telescopes. Configurations include: </p>
            <ul className="dialog-list">
              <li>Network SSID and password for wifi module WLAN mode</li>
              <li>Direct connect password for secure direct connect mode</li>
            </ul>
            <div className="dialog-warning">
              <Warning style={{marginRight: "8px", paddingLeft: "1em", overflow: "visible" }}size={24} fill={"#d29922"} />
              <span>At this moment, we require you to upgrade your wifi module to the latest firmware available firmware. Please be sure to download it <a href="#" onClick={(e) => e.preventDefault}>here</a> and install via CFM</span>
            </div>
            <br/>
            <p>How To Use</p>
            <hr></hr>
            <p>Clicking "Seek Devices" will search for an available wifi module. Please make sure your wifi module is accessible in the following ways:</p>
            <ul className="dialog-list">
              <li>Your wifi module is set to Direct Connect mode, and you are connected to the ad-hoc network (e.g. Celestron-###)</li>
              <li>Your wifi module is in WLAN mode, and it is properly configured to a known network</li>
            </ul>
            <p>You will then be prompted to input the wifi module's configurations (the module SSID cannot be changed). When your configurations are sent, the module will reboot, and your changes will have taken place.</p>
            <p>For further informations, refer to the manuals for the <a href="#" onClick={handleSkyportalLinkClick} target="_blank">SkyPortal</a> and <a href="#" onClick={handleEvolutionLinkClick} target="_blank">Evolution Mount</a> wifi modules.</p>
            <br/>
            <p>Frequently Asked Questions</p>
            <hr></hr>
            {
              [
                // {
                //   title: "How will I know my configurations worked?",
                //   answer: "Check for `MODULE CONFIGURED` in the status bar. If there were any invalid fields when you click \"Send Configurations\" (e.g. password too short), you will be prevented from attempting to configure the module.",
                // },
                // {
                //   title: "I've set my Direct Connect password, now what?",
                //   answer: "Sending configurations will reset the wifi module. Find your wifi module in the available networks and attempt to connect to it. Don't forget to write down your password!",
                // },
                {
                  title: "I've forgotten my Direct Connect password",
                  answer: "Follow the instructions for resetting your wifi module in the manual (links above). Resetting the module will clear the password, and you should be able to connect without needing your old password."
                },
                {
                  title: "Why is the Direct Connect password field is disabled?",
                  answer: "Some wifi modules do not allow you to clear or reset the password once it has been set. In order to avoid locking you out of your device, we are preventing users from setting a module direct connect password."
                },
                {
                  title: "Toggling from WLAN to Direct Connect is disabling my password",
                  answer: "You need the latest wifi module firmware in order to set the password properly. Please see instructions above to obtain this update.",
                },
                {
                  title: "My Direct Connect network appears as \"Celestron-### 2\" in my available networks",
                  answer: "This is a known issue that we are trying to work around. Windows is recognizing your wifi module's newly secured network as a different network. Connecting to this \"Celestron-### 2\" should work as if you were connected to \"Celestron-###\"",
                }
              ].map(question => (
                <details key={question.title} tabIndex={-1}>
                  <summary>{question.title}</summary>
                  <div className="faq-answer-container">
                    {question.answer}
                  </div>
                </details>
              ))
            }
          </div>
        </div>
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