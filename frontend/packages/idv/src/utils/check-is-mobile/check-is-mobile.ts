import UAParser from 'ua-parser-js';

export const checkIsAndroid = () => {
  const os = new UAParser().getOS();
  return os.name === 'Android';
};

export const checkIsIOS = () => {
  const os = new UAParser().getOS();
  return os.name === 'iOS';
};

export const checkIsMobile = () => {
  const os = new UAParser().getOS();
  return os.name === 'iOS' || os.name === 'Android';
};

export default checkIsMobile;
