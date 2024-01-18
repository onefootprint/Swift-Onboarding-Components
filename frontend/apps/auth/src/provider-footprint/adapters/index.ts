import generateIframeAdapter from './generate-iframe-adapter';
import generateWebViewAdapter from './generate-web-view-adapter';

const configureFootprint = () => {
  const IS_SSR = typeof window === 'undefined';
  return IS_SSR ? generateWebViewAdapter() : generateIframeAdapter();
};

export default configureFootprint;
