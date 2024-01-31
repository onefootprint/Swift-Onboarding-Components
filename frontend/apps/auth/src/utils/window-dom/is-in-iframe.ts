const isEmbeddedInIframe = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;

    const isInIframe = window.frameElement !== null;
    const isInIframeTopCheck = window.self !== window.top;
    return isInIframe || isInIframeTopCheck;
  } catch (err) {
    console.warn('Error checking iframe status:', err);
    return false;
  }
};

export default isEmbeddedInIframe;
