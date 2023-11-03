import { checkIsInIframe, checkIsInWebView } from '../../../utils';
import isAuthMode from '../utils/is-auth-mode';
import generateEmptyAdapter from './generate-empty-adapter';
import generateIframeAdapter from './generate-iframe-adapter';
import generateWebViewAdapter from './generate-web-view-adapter';

const IS_SSR = typeof window === 'undefined';

const configureFootprint = () => {
  const isInIframe = checkIsInIframe();
  const isInWebView = checkIsInWebView();

  if (isInWebView || isAuthMode()) {
    return generateWebViewAdapter();
  }
  if (IS_SSR || !isInIframe) {
    return generateEmptyAdapter();
  }
  return generateIframeAdapter();
};

export default configureFootprint;
