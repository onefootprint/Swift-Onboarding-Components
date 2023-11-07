import isAuthMode from '../utils/is-auth-mode';
import generateIframeAdapter from './generate-iframe-adapter';
import generateWebView from './generate-web-view-adapter';

const IS_SSR = typeof window === 'undefined';

const configureFootprint = () => {
  if (IS_SSR || isAuthMode()) {
    return generateWebView();
  }
  return generateIframeAdapter();
};

export default configureFootprint;
