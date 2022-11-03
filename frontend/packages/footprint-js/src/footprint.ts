import './footprint-styles.css';

import type { FootprintAppearance } from './types/footprint.types';
import { FootprintEvents, ShowFootprint } from './types/footprint.types';
import IframeManager from './utils/iframe-manager';
import { injectStyles } from './utils/ui-manager';

const iframeManager = new IframeManager();
let tokensParams = {};
let rulesParams = {};

const footprint = (url: string) => {
  const handleOnCompleted = (callback: (validationToken: string) => void) =>
    iframeManager.on(FootprintEvents.completed, (data: any) => {
      if (data && typeof data === 'string') {
        callback(data);
      }
    });

  const handleOnCanceled = (callback: () => void) =>
    iframeManager.on(FootprintEvents.canceled, callback);

  const setAppearance = ({ theme, variables, rules }: FootprintAppearance) => {
    const {
      fpButtonHeight,
      fpButtonBorderRadius,
      loadingBg,
      loadingColor,
      loadingPadding,
      loadingBorderRadius,
      overlayBg,
      ...remainingStyles
    } = variables;
    tokensParams = encodeURIComponent(JSON.stringify(remainingStyles));
    rulesParams = encodeURIComponent(JSON.stringify(rules));
    injectStyles({
      theme,
      variables: {
        fpButtonHeight,
        fpButtonBorderRadius,
        loadingBg,
        loadingColor,
        loadingPadding,
        loadingBorderRadius,
        overlayBg,
      },
    });
  };

  const show = async ({
    publicKey,
    onCompleted,
    onCanceled,
  }: ShowFootprint) => {
    await iframeManager.show({
      url: publicKey
        ? `${url}?public_key=${publicKey}&tokens=${tokensParams}&rules=${rulesParams}`
        : url,
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
