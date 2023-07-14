import IframeAdapter from './iframe-adapter';
import WebViewAdapter from './web-view-adapter';

const IS_SSR = typeof window === 'undefined';

const configureFootprint = () => {
  if (IS_SSR) {
    return new WebViewAdapter();
  }
  return new IframeAdapter();
};

export default configureFootprint;
