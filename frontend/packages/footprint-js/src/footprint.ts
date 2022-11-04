import './footprint-styles.css';

import type { FootprintAppearance } from './types/footprint.types';
import { FootprintEvents, ShowFootprint } from './types/footprint.types';
import IframeManager from './utils/iframe-manager';
import { injectStyles } from './utils/ui-manager';

const iframeManager = new IframeManager();
const appearanceParams = {
  variables: '',
  rules: '',
  fontSrc: '',
};

const footprint = (url: string) => {
  const handleOnCompleted = (callback: (validationToken: string) => void) =>
    iframeManager.on(FootprintEvents.completed, (data: any) => {
      if (data && typeof data === 'string') {
        callback(data);
      }
    });

  const handleOnCanceled = (callback: () => void) =>
    iframeManager.on(FootprintEvents.canceled, callback);

  const setAppearance = ({
    fontSrc,
    theme = 'light',
    variables = {},
    rules = {},
  }: FootprintAppearance) => {
    const {
      fpButtonBorderRadius,
      fpButtonHeight,
      loadingBg,
      loadingBorderRadius,
      loadingColor,
      loadingPadding,
      overlayBg,
      ...remainingStyles
    } = variables;
    if (Object.keys(remainingStyles).length) {
      appearanceParams.variables = encodeURIComponent(
        JSON.stringify(remainingStyles),
      );
    }
    if (Object.keys(rules).length) {
      appearanceParams.rules = encodeURIComponent(JSON.stringify(rules));
    }
    if (fontSrc) {
      appearanceParams.fontSrc = fontSrc;
    }
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

  const getSearchParams = (params: {
    fontSrc?: string;
    publicKey?: string;
    rules?: string;
    variables?: string;
  }) => {
    const { publicKey, variables, rules, fontSrc } = params;
    const searchParams = new URLSearchParams();
    if (publicKey) {
      searchParams.append('public_key', publicKey);
    }
    if (variables) {
      searchParams.append('tokens', variables);
    }
    if (rules) {
      searchParams.append('rules', rules);
    }
    if (fontSrc) {
      searchParams.append('font_src', fontSrc);
    }
    return searchParams.toString();
  };

  const show = async ({
    publicKey,
    onCompleted,
    onCanceled,
  }: ShowFootprint) => {
    const searchParams = getSearchParams({
      fontSrc: appearanceParams.fontSrc,
      publicKey,
      rules: appearanceParams.rules,
      variables: appearanceParams.variables,
    });
    await iframeManager.show({ url: `${url}?${searchParams}` });
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
