import './footprint-styles.css';

import type { FootprintAppearance } from './footprint-types';
import { FootprintEvents, ShowFootprint } from './footprint-types';
import IframeManager from './utils/iframe-manager';
import { injectStyles } from './utils/ui-manager';

const iframeManager = new IframeManager();
let tokens = {};

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
    const { fpButton, loading, overlay, ...remainingStyles } = variables;
    tokens = encodeURI(JSON.stringify(remainingStyles));
    injectStyles({ theme, variables: { fpButton, loading, overlay } });
  };

  const show = async ({
    publicKey,
    onCompleted,
    onCanceled,
  }: ShowFootprint) => {
    await iframeManager.show({
      url: publicKey ? `${url}?public_key=${publicKey}&tokens=${tokens}` : url,
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
