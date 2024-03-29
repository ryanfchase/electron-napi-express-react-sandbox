import React, { useState } from "react";
import "./index.css";

const CredentialsTable = ({ credentialName, defaultName, defaultPassphrase, ssidRef, passphraseRef, nameReadOnly=false, passphraseReadOnly=false}) => {
  const [name, setName] = useState(defaultName);
  const [passphrase, setPassphrase] = useState(defaultPassphrase);
  const [shouldHide, setShouldHide] = useState(true);
  const [error, setError] = useState('')

  const networkNameCannotBeNull = "The network SSID must not be null.";
  const passphraseLengthTooShort = "Non-empty password must be at least 8 characters";
  const cannotUpdateModulePassphrase = "Unable to modify direct connect password on certain wifi modules. Click info button for details.";

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
              ref={ssidRef}
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
            <span className="credential-title">{credentialName} Password</span>
          </td>
          <td>
            <input
              ref={passphraseRef}
              className="credential-input"
              value={passphrase}
              type={shouldHide ? "password" : "text"}
              placeholder={`Enter optional password`}
              disabled={passphraseReadOnly}
              onChange={handlePassphraseChange}
            >
            </input>
            <button className="celestron-button-small" onClick={handleOnClick}>{shouldHide ? 'Reveal' : 'Hide'}</button>
          </td>
        </tr>
        { error && (
          <tr>
            <td className="first-col"></td>
            <td className="credential-error">{error}</td>
          </tr>
        )}
        { passphraseReadOnly && (
          <tr>
            <td className="first-col"></td>
            <td className="credential-error">{cannotUpdateModulePassphrase}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default CredentialsTable;