import React from "react";
import "./index.css";
import noConnection from "../../../public/no-connection.webp";
const { ipcRenderer } = window.require('electron');



const TroubleshootingPage = () => {
  const handleLinkClick = (e) => {
    e.preventDefault();
    ipcRenderer.send('open-skyportal-manual');
  }

  return(
    <div>
      <p>
        <img className="no-connection-img" src={noConnection} alt="wifi no connection icon"/>
      </p>
      <p>There were no devices viewable on the network. Please follow these troubleshooting steps to make your device identifiable:</p>
      <ul>
        <li>Ensure that the wifi module is plugged in correctly, and the mount is on.</li>
        <li>If the wifi module is in direct connect, ensure you are connected to the ad-hoc network</li>
        <li>If the wifi module is in WLAN, ensure you are connected to the paired network</li>
        <li>If the above steps do not resolve the issue, attempt to reset the wifi module, see instructions manual <a href="#" onClick={handleLinkClick} target="_blank">here</a></li>
      </ul>
    </div>
  );
}

export default TroubleshootingPage;