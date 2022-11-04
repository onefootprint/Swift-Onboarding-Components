import './footprint-styles.css';

import type { FootprintAppearance } from './types/footprint.types';
import { FootprintEvents, ShowFootprint } from './types/footprint.types';
import IframeManager from './utils/iframe-manager';
import { injectStyles } from './utils/ui-manager';

const iframeManager = new IframeManager();
let variablesParams = '';
let rulesParams = '';

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
    theme = 'light',
    variables = {},
    rules = {},
  }: FootprintAppearance) => {
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
    if (Object.keys(remainingStyles).length) {
      variablesParams = encodeURIComponent(JSON.stringify(remainingStyles));
    }
    if (Object.keys(rules).length) {
      rulesParams = encodeURIComponent(JSON.stringify(rules));
    }
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

  const getSearchParams = (params: {
    publicKey?: string;
    variables?: string;
    rules?: string;
  }) => {
    const { publicKey, variables, rules } = params;
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
    return searchParams.toString();
  };

  const show = async ({
    publicKey,
    onCompleted,
    onCanceled,
  }: ShowFootprint) => {
    const searchParams = getSearchParams({
      publicKey,
      variables: variablesParams,
      rules: rulesParams,
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
