import './footprint-styles.css';

import type { FootprintAppearance } from './footprint-types';
import { FootprintEvents, ShowFootprint } from './footprint-types';
import IframeManager from './utils/iframe-manager';
import { injectExternalStyles } from './utils/ui-manager';

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

  const setAppearance = ({ theme, variables }: FootprintAppearance) => {
    injectExternalStyles({ theme, variables });
  };

  const show = async ({
    publicKey,
    onCompleted,
    onCanceled,
  }: ShowFootprint) => {
    await iframeManager.show({
      url: publicKey ? `${url}?public_key=${publicKey}` : url,
    });
    if (onCompleted) {
      handleOnCompleted(onCompleted);
    }
    if (onCanceled) {
      handleOnCanceled(onCanceled);
    }
  };

  return {
    setAppearance,
    show,
  };
};

export default footprint;
