import { checkIsInIframe } from '../../../utils';
import generateEmptyAdapter from './generate-empty-adapter';
import generateIframeAdapter from './generate-iframe-adapter';
import generateWebViewAdapter from './generate-web-view-adapter';

const configureFootprint = () => {
  const IS_SSR = typeof window === 'undefined';
  const isInIframe = checkIsInIframe();

  if (IS_SSR) {
    return generateEmptyAdapter();
  }
  if (isInIframe) {
    return generateIframeAdapter();
  }
  return generateWebViewAdapter();
};

export default configureFootprint;
