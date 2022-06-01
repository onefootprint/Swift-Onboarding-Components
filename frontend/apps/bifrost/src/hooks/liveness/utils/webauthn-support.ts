import UAParser from 'ua-parser-js';

const checkWebAuthnSupport = async () => {
  const uaParser = new UAParser();
  const device = uaParser.getDevice();
  if (device.type !== 'mobile') {
    return false;
  }
  let hasSupport = false;
  if (window.PublicKeyCredential) {
    hasSupport =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }
  return hasSupport;
};

export default checkWebAuthnSupport;
