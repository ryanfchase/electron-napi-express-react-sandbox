import React from "react";

const questions = (onClick) => [
  {
    title: "I've forgotten my Direct Connect password",
    answer: 
    (
      <>
        <div>If your module has been configured for WLAN mode, you can reset the Direct Connect password through the Wifi Password Manager. Set your wifi module to WLAN mode, connect to your device, and reset the Direct Connect password.</div>
        <br/>
        <div>You can also reset the direct connect password with the following procedure:</div>
        <div style={{marginLeft: "1em"}}>With the unit plugged in, toggle the Mode Select Switch 6 times in 5 seconds. For this method to work, you may need to update the firmware on your device. You can update your firmware with CFM, which can be downloaded <a href="#" target="_blank" onClick={onClick}>here</a>.</div>
      </>
    )
  },
  {
    title: "Why is the Direct Connect password field is disabled?",
    answer: "Direct connect password is currently supported only on 3rd generation wifi modules. These modules will have an SSID in the form of Celestron-### (with three digits after the dash)"
  },
  {
    title: "Toggling from WLAN to Direct Connect is disabling my Direct Connect password",
    answer: (
      <span>Secure direct connect mode is a newly released feature, it may require a firmware update in order to work properly. You can update your firmware with CFM, which can be downloaded <a href="#" target="_blank" onClick={onClick}>here</a>.</span>
    )
  },
  {
    // title: "My Direct Connect network appears as \"Celestron-### 2\" in my available networks",
    title: (
        <span>My Direct Connect network appears as <code>Celestron-### 2</code> in my available networks</span>
    ),
    // answer: "Windows is recognizing your wifi module's newly secured network as a different network. Connecting to this \"Celestron-### 2\" should work as if you were connected to \"Celestron-###\"",
    answer: (
      <span>Windows is recognizing your wifi module's newly secured network as a different network. Connecting to <code>Celestron-### 2</code> should work as if you were connected to <code>Celestron-###</code></span>
    ),
  }
];

export default questions;
