import generateIframeAdapter from './generate-iframe-adapter';
import generateWebViewAdapter from './generate-web-view-adapter';

const IS_SSR = typeof window === 'undefined';

const configureFootprint = () => {
  if (IS_SSR) {
    return generateWebViewAdapter();
  }
  return generateIframeAdapter();
};

export default configureFootprint;
