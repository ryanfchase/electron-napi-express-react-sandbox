import connectionHelper from "../../util/connectionHelper";

export const verifyRefs = async (
  networkSsidRef,
  networkPassphraseRef,
  modulePassphraseRef,
  setStatus,
  setStatusMessage) => {

    const allRefsCurrent = [
      networkSsidRef,
      networkPassphraseRef,
      modulePassphraseRef,
    ].every(ref => ref.current !== undefined && ref.current.value !== undefined)

    if (!allRefsCurrent) {
      setStatus('error');
      setStatusMessage("INTERNAL APPLICATION ERROR, PLEASE TRY AGAIN");
      return;
    }
    if (networkSsidRef.current.value === '') {
      setStatus('warning');
      setStatusMessage("NETWORK SSID NOT AN OPTIONAL FIELD. PLEASE SUPPLY A NETWORK");
      return;
    }
    let formNetworkPassphrase = networkPassphraseRef.current.value;
    if (formNetworkPassphrase !== '' && formNetworkPassphrase.length < 8) {
      setStatus('warning');
      setStatusMessage("NON-EMPTY NETWORK PASSWORD MUST BE AT LEAST 8 CHARACTERS");
      return;
    }
    let formModulePassphrase = modulePassphraseRef.current.value;
    if (formModulePassphrase !== '' && formModulePassphrase.length < 8) {
      setStatus('warning');
      setStatusMessage("NON-EMPTY MODULE PASSWORD MUST BE AT LEAST 8 CHARACTERS");
      return;
    }
};

export const sendConfiguration = async (
  networkSsidRef,
  networkPassphraseRef,
  modulePassphraseRef,
  setStatus,
  setStatusMessage
) => {
    const { error, configureSuccess } = await connectionHelper.configureModule(
      networkSsidRef.current.value,
      networkPassphraseRef.current.value,
      modulePassphraseRef.current.value
    );

    if (error) {
      console.log('unable to configure the module: ', error);
      setStatusMessage('ERROR WHILE SENDING CONFIGURATIONS. PLEASE RESTART THE APPLICATION.');
      setStatus('error');
    }
    else {
      console.log('configured module successfully', configureSuccess);
      setStatusMessage('MODULE CONFIGURED. TOGGLE THE MODE SELECT SWITCH ON YOUR DEVICE');
      setStatus('success');
    }

}