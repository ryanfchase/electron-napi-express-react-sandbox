import React from "react";
import "./index.css";
import noConnection from "../../../public/no-connection.webp";

const TroubleshootingPage = () => {

  return(
    <div>
      <p>
        <img className="no-connection-img" src={noConnection} alt="wifi no connection icon"/>
      </p>
      <p>There were no devices viewable on the network. Please follow these troubleshooting steps to make your device identifiable:</p>
      <ul>
        <li>Ensure that the wifi module is plugged in correctly and the mount is powered on.</li>
        <li>If the wifi module is in Direct Connect mode, and you are connected to the ad-hoc network (e.g. Celestron-###)</li>
        <li>If the wifi module is in WLAN, and your computer is connected to the same network</li>
        <li>If the above steps do not resolve the issue, attempt to reset the wifi module, see instructions in the FAQ section</li>
      </ul>
    </div>
  );
}

export default TroubleshootingPage;