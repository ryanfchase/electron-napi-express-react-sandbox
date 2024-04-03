import React from "react";
import Banner from "../../../public/celestron-big.webp"
import Warning from "../../components/svg/Warning";
import "./index.css";

const InfoPage = ({handleClose, handleSkyportalLinkClick, handleEvolutionLinkClick}) => {
  const questions = [
    {
      title: "I've forgotten my Direct Connect password",
      answer: 
      (
        <>
          <div>If your module has been configured for WLAN mode, you can reset the Direct Connect password through the Wifi Password Manager. Set your wifi module to WLAN mode, connect to your device, and reset the Direct Connect password.</div>
          <br/>
          <div>You can also reset the direct connect password with the following procedure:</div>
          <div style={{marginLeft: "1em"}}>With the unit plugged in, toggle the Mode Select Switch 6 times in 5 seconds. For this method to work, you may need to update the firmware on your device. You can update your firmware with CFM, which can be downloaded <a href="#" onClick={(e) => e.preventDefault}>here</a>.</div>
        </>
      )
    },
    {
      title: "Why is the Direct Connect password field is disabled?",
      // answer: "Some wifi modules do not allow you to clear or reset the password once it has been set. In order to avoid locking you out of your device, we are preventing users from setting a module direct connect password."
      answer: "Direct connect password is currently supported only on 3rd generation wifi modules. These modules will have an SSID in the form of Celestron-### (with three digits after the dash)"
    },
    {
      title: "Toggling from WLAN to Direct Connect is disabling my Direct Connect password",
      // answer: "You need the latest wifi module firmware in order to set the password properly. Please see instructions above to obtain this update.",
      answer: (
          <span>Secure direct connect mode is a newly released feature, it may require a firmware update in order to work properly. You can update your firmware with CFM, which can be downloaded <a href="#" onClick={(e) => e.preventDefault}>here</a>.</span>
      )
    },
    {
      title: "My Direct Connect network appears as \"Celestron-### 2\" in my available networks",
      answer: "Windows is recognizing your wifi module's newly secured network as a different network. Connecting to this \"Celestron-### 2\" should work as if you were connected to \"Celestron-###\"",
    }
  ];
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
          <span>Secure direct connect mode is a newly released feature, it may require a firmware update in order to work properly. You can update your firmware with CFM, which can be downloaded <a href="#" onClick={(e) => e.preventDefault}>here</a>.</span>
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
          <p>4. Toggle the <b>Mode Select Switch</b> on your device.</p>
        </div>
        <p>For further information, refer to the manual for the <a href="#" onClick={handleSkyportalLinkClick} target="_blank">SkyPortal</a> and <a href="#" onClick={handleEvolutionLinkClick} target="_blank">Evolution Mount</a> wifi modules.</p>
        <br/>
        <p>Frequently Asked Questions</p>
        <hr></hr>
        {
          questions.map(question => (
            <details key={question.title} tabIndex={-1}>
              <summary>{question.title}</summary>
              {/* <div className="faq-answer-container"> */}
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