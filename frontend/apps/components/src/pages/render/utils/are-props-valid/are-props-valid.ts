/* eslint-disable no-console */

import type { FootprintRenderDataProps } from '@onefootprint/footprint-js';
import { isObject, isString, isStringValid } from '@onefootprint/idv';

import isValidDI from '../is-valid-di';

const arePropsValid = (props?: Record<string, unknown>): props is FootprintRenderDataProps => {
  if (!props || !isObject(props)) {
    console.error('Received empty props');
    return false;
  }

  const { authToken, id, label, canCopy, defaultHidden, showHiddenToggle } = props;

  const isAuthTokenValid = isStringValid(authToken);
  if (!isAuthTokenValid) console.error('Valid auth token is required.');

  const isIdValid = isStringValid(id) && isValidDI(id);
  if (!isIdValid) console.error('Id has to be a valid data identifier, received: ', id);

  const isLabelValid = isString(label) || typeof label === 'undefined';
  if (!isLabelValid) console.error('Label must be a string or undefined.');

  const isCanCopyValid = typeof canCopy === 'boolean' || typeof canCopy === 'undefined';
  if (!isCanCopyValid) console.error('canCopy must be a boolean or undefined.');

  const isDefaultHiddenValid = typeof defaultHidden === 'boolean' || typeof defaultHidden === 'undefined';
  if (!isDefaultHiddenValid) console.error('defaultHidden must be a boolean or undefined.');

  const isShowHiddenToggleValid = typeof showHiddenToggle === 'boolean' || typeof showHiddenToggle === 'undefined';
  if (!isShowHiddenToggleValid) console.error('showHiddenToggle must be a boolean or undefined.');

  return (
    isAuthTokenValid && isIdValid && isLabelValid && isCanCopyValid && isDefaultHiddenValid && isShowHiddenToggleValid
  );
};

export default arePropsValid;
