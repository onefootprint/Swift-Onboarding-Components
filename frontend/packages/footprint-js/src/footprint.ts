import './footprint-styles.css';

import { FootprintPublicEvent, OpenFootprint } from './footprint-js.types';
import IframeManager from './utils/footprint-iframe';
import { createButton } from './utils/footprint-ui';
import { getAppearanceStyles, getURL } from './utils/footprint-utils';

const iframeManager = new IframeManager();
let hasIframeOpened = false;

const footprint = () => {
  const subscribeToComplete = (callback?: (validationToken: string) => void) =>
    iframeManager.on(FootprintPublicEvent.completed, (data: any) => {
      if (data && typeof data === 'string') {
        callback?.(data);
      }
    });

  const subscribeToCancel = (callback: () => void) =>
    iframeManager.on(FootprintPublicEvent.canceled, callback);

  const subscribeToClose = (callback: () => void) =>
    iframeManager.on(FootprintPublicEvent.closed, callback);

  const open = async ({
    appearance,
    onCanceled,
    onCompleted,
    publicKey,
    userData,
    options,
  }: OpenFootprint) => {
    if (hasIframeOpened) {
      return;
    }
    hasIframeOpened = true;

    const { fontSrc, rules, variables } = getAppearanceStyles(appearance);
    const url = getURL({ fontSrc, publicKey, rules, variables });
    await iframeManager.open(url, userData, options);
    subscribeToComplete(onCompleted);
    subscribeToCancel(() => {
      onCanceled?.();
      close();
    });
    subscribeToClose(close);
  };

  const close = async () => {
    await iframeManager.close();
    hasIframeOpened = false;
  };

  return {
    open,
    close,
    createButton,
  };
};

export default footprint;
