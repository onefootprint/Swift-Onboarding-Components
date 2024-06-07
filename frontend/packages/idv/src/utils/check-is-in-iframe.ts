// Check whether we are in top most window (aka not in an iframe)
// Some browsers (Internet explorer) may throw an error when
// trying to access window.top if running in an iframe
const checkIsIframe = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.self !== window.top;
  } catch (_e) {
    return true;
  }
};

export default checkIsIframe;
