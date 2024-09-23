import isEmbeddedInIframe from '../../utils/is-in-iframe';
import generateEmptyAdapter from './generate-empty-adapter';
import generateIframeAdapter from './generate-iframe-adapter';
import generateWebViewAdapter from './generate-web-view-adapter';

const configureFootprint = () => {
  const isEmptyAdapter = typeof window === 'undefined';
  const isInIframe = isEmbeddedInIframe();

  if (isEmptyAdapter) {
    return generateEmptyAdapter();
  }

  if (isInIframe) {
    return generateIframeAdapter();
  }

  return generateWebViewAdapter();
};

export default configureFootprint;
