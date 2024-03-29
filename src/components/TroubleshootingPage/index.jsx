import React from "react";
import "./index.css";

const TroubleshootingPage = () => (
  <div>
    <p>There were no devices viewable on the network. Please follow these troubleshooting steps to make your device identifiable:</p>
    <ul>
      <li>Ensure that the wifi module is plugged in correctly, and the mount is on.</li>
      <li>If the wifi module is in direct connect, ensure you are connected to the ad-hoc network</li>
      <li>If the wifi module is in WLAN, ensure you are connected to the paired network</li>
      <li>If the above steps do not resolve the issue, attempt to reset the wifi module,see instructions [here]</li>
    </ul>
  </div>
)

export default TroubleshootingPage;