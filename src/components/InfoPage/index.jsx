import React from "react";
import Banner from "../../../public/celestron-big.webp"
import Warning from "../../components/svg/Warning";
import questions from "./questions";
import { openCfmLink, openEvolutionLink, openSkyPortalLink } from "../../util/ipc";
import "./index.css";

const InfoPage = ({handleClose}) => {
  return(
    <>
      <div className="dialog-header">
        <span>About This Application</span>
        <span className="dialog-close-button" onClick={handleClose}>X</span>
      </div>
      <div>
        <hr></hr>
      </div>
      <div className="dialog-banner" >
        <img src={Banner} alt="celestron-banner"/>
      </div>
      <div className="dialog-contents-container">
        <div id="first-content" className="dialog-contents">
          <p>The <b>Celestron Wifi Password Manager</b> is a tool that lets you configure network settings for your Celestron wifi accessories and wifi-enabled telescopes. Configurations include: </p>
          <ul className="dialog-list">
            <li>Network SSID and password for WLAN mode</li>
            <li>Direct connect password for secure direct connect mode</li>
          </ul>
        </div>
        <div className="dialog-warning">
          <Warning style={{marginRight: "8px", paddingLeft: "1em", overflow: "visible" }}size={24} fill={"#d29922"} />
          <span>Secure direct connect mode is a newly released feature, it may require a firmware update in order to work properly. You can update your firmware with CFM, which can be downloaded <a href="#" target="_blank" onClick={openCfmLink}>here</a>.</span>
        </div>
        <br/>
        <p>How To Use</p>
        <hr></hr>
        <u>Setup</u>
        <div className="dialog-contents">
          <p>Please make sure your wifi module is accessible in one of the following ways:</p>
          <ul className="dialog-list">
            <li>Your wifi module is set to Direct Connect mode, and you are connected to the ad-hoc network (e.g. <code>Celestron-###</code>)</li>
            <li>Your wifi module is in WLAN mode and your computer is connected to the same network</li>
          </ul>
        </div>
        <u>Finding and Configuring Your Module</u>
        <div className="dialog-contents">
          <p>1. Clicking <b>Seek Devices</b> will search for an available wifi module.</p>
          <p>2. Enter your network credentials</p>
          <p>3. Click <b>Send Configuration</b></p>
          <p>4. Toggle the <b>Mode Select Switch</b> on your device to WLAN mode, then toggle it back to Direct Connect mode. Alternatively, power cycle the wifi module. Be sure to leave a few moments for your computer to detect that the Direct Connect network has been modified.</p>
        </div>
        <p>For further information, refer to the manual for the <a href="#" onClick={openSkyPortalLink} target="_blank">SkyPortal</a> and <a href="#" onClick={openEvolutionLink} target="_blank">Evolution Mount</a> wifi modules.</p>
        <br/>
        <p>Frequently Asked Questions</p>
        <hr></hr>
        {
          questions.map(question => (
            <details key={question.title} tabIndex={-1}>
              <summary>{question.title}</summary>
              <div className="dialog-contents">
                <p>{question.answer}</p>
              </div>
            </details>
          ))
        }
      </div>
    </>
  );
}

export default InfoPage;