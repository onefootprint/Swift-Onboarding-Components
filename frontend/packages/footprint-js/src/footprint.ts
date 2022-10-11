import './footprint-styles.css';

import { FootprintEvents, ShowFootprint } from './footprint-types';
import IframeManager from './utils/iframe-manager';

const iframeManager = new IframeManager();

const footprint = (url: string) => {
  const handleOnCompleted = (callback: (validationToken: string) => void) =>
    iframeManager.on(FootprintEvents.completed, (data: any) => {
      if (data && typeof data === 'string') {
        callback(data);
      }
    });

  const handleOnCanceled = (callback: () => void) =>
    iframeManager.on(FootprintEvents.canceled, callback);

  return {
    show: async ({ publicKey, onCompleted, onCanceled }: ShowFootprint) => {
      await iframeManager.show({
        url: publicKey ? `${url}?public_key=${publicKey}` : url,
      });
      if (onCompleted) {
        handleOnCompleted(onCompleted);
      }
      if (onCanceled) {
        handleOnCanceled(onCanceled);
      }
    },
  };
};

export default footprint;
