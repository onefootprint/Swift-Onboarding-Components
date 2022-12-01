import './footprint-styles.css';

import {
  FootprintAppearance,
  FootprintEvents,
  ShowFootprint,
} from './footprint-js.types';
import IframeManager from './utils/footprint-iframe';
import { createButton, injectStyles } from './utils/footprint-ui';
import { getAppearanceStyles, getURL } from './utils/footprint-utils';

const iframeManager = new IframeManager();
let hasIframeOpened = false;

const footprint = () => {
  const setDialogStyles = ({
    theme = 'light',
    variables = {},
  }: FootprintAppearance = {}) => {
    const {
      fpButtonBorderRadius,
      fpButtonHeight,
      loadingBg,
      loadingBorderRadius,
      loadingColor,
      loadingPadding,
      overlayBg,
    } = variables;
    injectStyles({
      theme,
      variables: {
        fpButtonBorderRadius,
        fpButtonHeight,
        loadingBg,
        loadingBorderRadius,
        loadingColor,
        loadingPadding,
        overlayBg,
      },
    });
  };

  const handleOnCompleted = (callback: (validationToken: string) => void) =>
    iframeManager.on(FootprintEvents.completed, (data: any) => {
      if (data && typeof data === 'string') {
        callback(data);
      }
    });

  const handleOnCanceled = (callback: () => void) =>
    iframeManager.on(FootprintEvents.canceled, callback);

  const handleOnClosed = (callback: () => void) =>
    iframeManager.on(FootprintEvents.closed, callback);

  const show = async ({
    appearance,
    publicKey,
    onCompleted,
    onCanceled,
  }: ShowFootprint) => {
    if (hasIframeOpened) {
      console.warn('Cannot open two instances of Footprint at the same time');
      return;
    }

    setDialogStyles(appearance);
    const { fontSrc, rules, variables } = getAppearanceStyles(appearance);
    const url = getURL({ fontSrc, publicKey, rules, variables });
    await iframeManager.show(url);

    if (onCompleted) {
      handleOnCompleted(onCompleted);
    }
    if (onCanceled) {
      handleOnCanceled(onCanceled);
    }
    handleOnClosed(close);
  };

  const close = async () => {
    await iframeManager.close();
    hasIframeOpened = false;
  };

  return {
    show,
    close,
    createButton,
  };
};

export default footprint;
