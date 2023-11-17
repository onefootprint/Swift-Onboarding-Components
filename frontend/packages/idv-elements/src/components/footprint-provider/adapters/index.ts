import { checkIsInIframe } from '../../../utils';
import generateEmptyAdapter from './generate-empty-adapter';
import generateIframeAdapter from './generate-iframe-adapter';
import generateWebViewAdapter from './generate-web-view-adapter';

const IS_SSR = typeof window === 'undefined';

const configureFootprint = () => {
  const isInIframe = checkIsInIframe();

  if (IS_SSR) {
    return generateEmptyAdapter();
  }
  if (isInIframe) {
    return generateIframeAdapter();
  }
  // if not running in webview or iframe, (running directly on id.onefootprint.com)
  return generateWebViewAdapter();
};

export default configureFootprint;
