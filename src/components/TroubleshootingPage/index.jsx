import React from "react";
import "./index.css";
import noConnection from "../../../public/no-connection.webp";
const { ipcRenderer } = window.require('electron');



const TroubleshootingPage = () => {
  const handleSkyportalLinkClick = (e) => {
    e.preventDefault();
    ipcRenderer.send('open-skyportal-manual');
  }
  const handleEvolutionLinkClick = (e) => {
    e.preventDefault();
    ipcRenderer.send('open-evolution-manual');
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
        <li>If the above steps do not resolve the issue, attempt to reset the wifi module, see instructions manual for the <a href="#" onClick={handleSkyportalLinkClick} target="_blank">SkyPortal</a> or <a href="#" onClick={handleEvolutionLinkClick} target="_blank">Evolution Mount</a></li>
      </ul>
    </div>
  );
}

export default TroubleshootingPage;