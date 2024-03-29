import React from "react";
import WifiSvg from "../svg/WifiSvg";
import CredentialsTable from "../CredentialsTable";
import "./index.css";

// const DeviceManager = ({networkName, networkPassphrase, moduleName, modulePassphrase}) => {
const DeviceManager = ({ moduleName, credentials, handleFinalSubmit }) => {

  const configureWifiModule = "Configure Wifi Module";

  return (
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
      { credentials.map(table => (
        <CredentialsTable
          key={table.formName}
          credentialName={table.formName}
          ssidRef={table.ssidRef}
          passphraseRef={table.passphraseRef}
          defaultName={table.defaultName}
          defaultPassphrase={table.defaultPassphrase}
        />
      )) }
      <div className="final-submit-section">
        <button className="celestron-button" onClick={handleFinalSubmit}>
          {configureWifiModule}
        </button>
      </div>
    </>
  );
}

export default DeviceManager;