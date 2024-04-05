const { electronApi } = window;

// Informs main.js that the react components are rendered
export const signalReactReady = () => electronApi.signal('react-ready');

const cfmLink = "https://www.celestron.com/pages/drivers-and-software";
const evolutionLink = "https://s3.amazonaws.com/celestron-site-support-files/support_files/CELESTRON_NexStarEVOLUTION_Manual.pdf";
const skyPortalLink = "https://celestron-site-support-files.s3.amazonaws.com/support_files/93973_Celestron%20SkyPortal%20WiFi%20Accessory_Manual_5LANG_Web.pdf";

export const openCfmLink = (e) => {
  e.preventDefault();
  electronApi.openUrl(cfmLink);
}

export const openEvolutionLink = (e) => {
  e.preventDefault();
  electronApi.openUrl(evolutionLink);
}

export const openSkyPortalLink = (e) => {
  e.preventDefault();
  electronApi.openUrl(skyPortalLink);
}