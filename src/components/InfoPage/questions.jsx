import React from "react";
import { openCfmLink } from "../../util/ipc";

const questions = [
  {
    title: "I've forgotten my Direct Connect password",
    answer: 
    (
      <>
        <span>If your module has been configured for WLAN mode, you can reset the Direct Connect password through the Wifi Password Manager. Set your wifi module to WLAN mode, connect to your device, and reset the Direct Connect password.</span>
        <br/>
        <span>You can also reset the direct connect password with the following procedure:</span>
        <br/>
        <span style={{paddingLeft: "1em", display: "block"}}>With the unit plugged in, toggle the <b>Mode Select Switch</b> 6 times in 5 seconds. For this method to work, you may need to update the firmware on your device. You can update your firmware with CFM, which can be downloaded <a href="#" target="_blank" onClick={openCfmLink}>here</a>.</span>
      </>
    )
  },
  {
    title: "Why is the Direct Connect password field is disabled?",
    answer: <span>Direct connect password is currently supported only on 3rd generation wifi modules. These modules will have an SSID in the form of <code>Celestron-###</code> (with three digits after the dash)</span>
  },
  {
    title: "Toggling from WLAN to Direct Connect is disabling my Direct Connect password",
    answer: (
      <span>Secure direct connect mode is a newly released feature, it may require a firmware update in order to work properly. You can update your firmware with CFM, which can be downloaded <a href="#" target="_blank" onClick={openCfmLink}>here</a>.</span>
    )
  },
  {
    title: (
        <span>My Direct Connect network appears as <code>Celestron-### 2</code> in my available networks</span>
    ),
    answer: (
      <span>Windows is recognizing your wifi module's newly secured network as a different network. Connecting to <code>Celestron-### 2</code> should work as if you were connected to <code>Celestron-###</code></span>
    ),
  },
  {
    title: "Why does my Direct Connect password sometimes become unset?",
    answer: "Your wifi module is most likely not yet supported at this time. While 3rd generation modules allow a password to be reset, older modules will clear the password when toggling from Direct Connect to WLAN mode. We expect to add support for these modules as soon as we can."
  }
];

export default questions;
