import React, { useState, useEffect } from "react";
import "./App.css";
import celestronSmall from "../public/celestron-small-light.png";
import wifiTechnology from "../public/wifi-technology.avif";
import noConnection from "../public/no-connection.webp";
import loading from "../public/loading.gif";
import axios from './api';

const WifiSvg = ({ height=512, width=640, scale=1, style, fill }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    viewBox={`0 0 ${width * scale} ${height * scale}`}
    height={height * scale}
    width={width * scale}
    style={{...style}}
    fill={fill}
  >
    <g transform={`scale(${scale})`}>
      <path d="M54.2 202.9C123.2 136.7 216.8 96 320 96s196.8 40.7 265.8 106.9c12.8 12.2 33 11.8 45.2-.9s11.8-33-.9-45.2C549.7 79.5 440.4 32 320 32S90.3 79.5 9.8 156.7C-2.9 169-3.3 189.2 8.9 202s32.5 13.2 45.2 .9zM320 256c56.8 0 108.6 21.1 148.2 56c13.3 11.7 33.5 10.4 45.2-2.8s10.4-33.5-2.8-45.2C459.8 219.2 393 192 320 192s-139.8 27.2-190.5 72c-13.3 11.7-14.5 31.9-2.8 45.2s31.9 14.5 45.2 2.8c39.5-34.9 91.3-56 148.2-56zm64 160a64 64 0 1 0 -128 0 64 64 0 1 0 128 0z"/>
    </g>
  </svg>
);

const InfoSvg = ({ size=512, scale=1, style, fill }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={`0 0 ${size * scale} ${size * scale}`}
    height={size * scale}
    width={size * scale}
    fill={fill}
    style={{...style}}
  >
    <g transform={`scale(${scale})`}>
      <path d="M 25 2 C 12.264481 2 2 12.264481 2 25 C 2 37.735519 12.264481 48 25 48 C 37.735519 48 48 37.735519 48 25 C 48 12.264481 37.735519 2 25 2 z M 25 4 C 36.664481 4 46 13.335519 46 25 C 46 36.664481 36.664481 46 25 46 C 13.335519 46 4 36.664481 4 25 C 4 13.335519 13.335519 4 25 4 z M 25 11 A 3 3 0 0 0 25 17 A 3 3 0 0 0 25 11 z M 21 21 L 21 23 L 23 23 L 23 36 L 21 36 L 21 38 L 29 38 L 29 36 L 27 36 L 27 21 L 21 21 z"></path>
    </g>
  </svg>
)

const CredentialsTable = ({ credentialName, defaultName, defaultPassphrase, nameReadOnly=false, }) => {
  const [name, setName] = useState(defaultName);
  const [passphrase, setPassphrase] = useState(defaultPassphrase);
  const [shouldHide, setShouldHide] = useState(true);
  const [error, setError] = useState('')

  const networkNameCannotBeNull = "The network SSID must not be null.";
  const passphraseLengthTooShort = "Non-empty passphrase must be at least 8 characters";
  const handleOnClick = () => {
    setShouldHide((prevShouldHide) => !prevShouldHide);
  }

  const handleNameChange = (e) => {
    e.preventDefault();
    if (e.target.value.trim().length === 0) {
      setError(networkNameCannotBeNull);
    }
    else if (error !== '') {
      setError('');
    }

    setName(e.target.value);
  }

  const handlePassphraseChange = (e) => {
    e.preventDefault();
    if (e.target.value.length > 0 &&
      e.target.value.length < 8) {
        setError(passphraseLengthTooShort)
      }
    else if (error !== '') {
      setError('');
    }

    setPassphrase(e.target.value);
  }

  return (
    <table className="credential-table">
      <tbody>
        <tr>
          <td className="device-detail first-col">
            <span className="credential-title">{credentialName} SSID</span>
          </td>
          <td>
            <input
              className="credential-input"
              value={name}
              type="text"
              disabled={nameReadOnly}
              placeholder={`Enter SSID`}
              onChange={handleNameChange}
            >
            </input>
          </td>
        </tr>
        <tr>
          <td className="device-detail first-col">
            <span className="credential-title">{credentialName} Passphrase</span>
          </td>
          <td>
            <input
              className="credential-input"
              value={passphrase}
              type={shouldHide ? "password" : "text"}
              placeholder={`Enter optional passphrase`}
              onChange={handlePassphraseChange}
            >
            </input>
            <button className="celestron-button-small" onClick={handleOnClick}>{shouldHide ? 'Reveal' : 'Hide'}</button>
          </td>
        </tr>
        <tr>
          <td></td>
          <td className="credential-error">{error}</td>
        </tr>
      </tbody>
    </table>
  );
}


const testObject = [
  {
    networkName: "ROUTER-5G",
    networkPassphrase: "MyPlaintextPassword",
    moduleName: "ORI-04C",
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

const content = {
  headerText: "Celestron Wifi Password Manager",
  fakeNetworkName: testObject[0].networkName,
  fakeNetworkPassphrase: testObject[0].networkPassphrase,
  fakeModuleName: testObject[0].moduleName,
  fakeModulePassphrase: testObject[0].modulePassphrase,
  sendDeviceInfo: "Configure Wifi Module",
  fakeDeviceStatus: "success",
  fakeDeviceStatusMessage: "SEEKING DEVICES . . .",
};

function App() {
  const [networkName, setNetworkName] = useState(content.fakeNetworkName);
  const [networkPassphrase, setNetworkPassphrase] = useState(content.fakeNetworkPassphrase);
  const [moduleName, setModuleName] = useState(content.fakeModuleName);
  const [modulePassphrase, setModulePassphrase] = useState(content.fakeModulePassphrase);
  const [status, setStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState(content.fakeDeviceStatusMessage)
  const [deviceFound, setDeviceFound] = useState(false);
  // todo - remove
  const [testIdx, setTestIdx] = useState(0);

  useEffect(() => {
    handleSeekDevices();
  }, []);

  const handleFinalSubmit = () => {
    setStatus('');
    setStatusMessage('SENDING CONFIGURATIONS . . .');
    setTimeout(() => {
      if (networkName === '' || (modulePassphrase.length != 0 && modulePassphrase.length < 8) ) {
        setStatusMessage('ERROR WHILE ATTEMPTING TO CONFIGURE');
        setStatus('failure');
      }
      else {
        setStatusMessage('MODULE CONFIGURED');
        setStatus('success');
      }
    }, 3000)
  }

  const macAddressToModuleName = (mac) => mac.split(':').slice(-2).join('').slice(-3);
  const handleSeekDevices = async () => {
    setDeviceFound(false);
    setStatus('');
    setStatusMessage(content.fakeDeviceStatusMessage); // this is actually ok
    // setTestIdx((prevIdx) => (prevIdx + 1) % testObject.length);

    let res;

    // first attempt to get last ip address
    res = await axios.get('/last-address')
    if (res.data.error) {
      console.log('could not obtain last ip-address')
    }
    else {
      const lastAddress = res.data.lastAddress;
      console.log('last ip we saw was: ', lastAddress)

      // second, attempt to connect via that ip address
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
        console.log('response to last ip res was: ', res);

        // do something
        setNetworkName(res.data['wlan.ssid']);
        setNetworkPassphrase(res.data['wlan.passkey']);
        setModuleName(`Celestron-${macAddressToModuleName(res.data['wlan.mac'])}`);
        setModulePassphrase(res.data['softap.passkey']);
        setStatus('success');
        setStatusMessage('MODULE FOUND');
        setDeviceFound(true);
        return;
      }
    }

    // if that fails, attempt to get a broadcast response
    let broadcast = await axios.get('/broadcast');
    console.log(`express/info gets`, broadcast.data.address);

    if (broadcast.data.error) {
      // unable to find broadcast signal, failure...
      console.log("unable to find _any_ signal... cannot proceed");
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
      }
      else {
        // since we found an ip address, save it...
        let updateLastIpRes = await axios.post('/last-address', {
          address: broadcast.data.address,
        });

        console.log('post express/last-address returns ' , updateLastIpRes.data);

        setNetworkName(res.data['wlan.ssid']);
        setNetworkPassphrase(res.data['wlan.passkey']);
        setModuleName(`Celestron-${macAddressToModuleName(res.data['wlan.mac'])}`);
        setModulePassphrase(res.data['softap.passkey']);
        setStatus('success');
        setStatusMessage('MODULE FOUND');
        setDeviceFound(true);
        return;
      }
    }
  }

  return (
    <div id="inner-container">
      <div id="navbar" className="celestron-background">
        <div className="navbar-item">
          <img className="celestron-icon-small" src={wifiTechnology} alt="Celestron Icon Small" />
        </div>
        <div className="navbar-item navbar-title">
          {content.headerText}
        </div>
        <div className="navbar-item navbar-info">
          <div className="celestron-icon-small">
            <div className="clickable-icon">
              <InfoSvg size={48} scale={0.50} fill="grey"/>
            </div>
          </div>
        </div>
      </div>
      <div id="wifi-tool-control-bar" className="celestron-background">
        <div className="centered-controls">
          <button className="celestron-control-button" onClick={handleSeekDevices}>Seek Devices</button>
          <div className={`pre-container ${status}`}>
            <code>
              {statusMessage}
            </code>
          </div>
        </div>
      </div>
      <div id="wifi-device-details">
        { deviceFound ? (
          <>
            <table className="device-name-table">
              <tbody>
                <tr>
                  <td className="first-col">
                    <div className="device-icon celestron-unselected celestron-background-gradient">
                      <WifiSvg scale={0.05} fill={"#fd8204"} />
                    </div>
                  </td>
                  <td>
                    <span className="device-title">{moduleName}</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <CredentialsTable
              credentialName="network"
              defaultName={networkName}
              defaultPassphrase={networkPassphrase} />
            <CredentialsTable
              nameReadOnly
              credentialName="direct connect"
              defaultName={moduleName}
              defaultPassphrase={modulePassphrase} />
            <div className="final-submit-section">
              <button className="celestron-button" onClick={handleFinalSubmit}>
                {content.sendDeviceInfo}
              </button>
            </div>
          </>
        ) : (
          <div className="loading-gif-container">
            <img className="loading-gif" src={loading} alt="loading-devices"/>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;