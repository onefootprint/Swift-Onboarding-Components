/* eslint-disable no-console */

import { FootprintRenderDataProps } from '../../types';
import isValidDI from '../is-valid-di';

const isObject = (obj: any) => typeof obj === 'object';

const arePropsValid = (
  props?: Record<string, any>,
): props is FootprintRenderDataProps => {
  if (!props || !isObject(props)) {
    console.error('Received empty props');
    return false;
  }

  const { authToken, id, label, canCopy, defaultHidden, showHiddenToggle } =
    props;

  const isAuthTokenValid = typeof authToken === 'string' && !!authToken;
  if (!isAuthTokenValid) console.error('Valid auth token is required.');

  const isIdValid = typeof id === 'string' && !!id && isValidDI(id);
  if (!isIdValid)
    console.error('Id has to be a valid data identifier, received: ', id);

  const isLabelValid = typeof label === 'string' || label === undefined;
  if (!isLabelValid) console.error('Label must be a string or undefined.');

  const isCanCopyValid = typeof canCopy === 'boolean' || canCopy === undefined;
  if (!isCanCopyValid) console.error('canCopy must be a boolean or undefined.');

  const isDefaultHiddenValid =
    typeof defaultHidden === 'boolean' || defaultHidden === undefined;
  if (!isDefaultHiddenValid)
    console.error('defaultHidden must be a boolean or undefined.');

  const isShowHiddenToggleValid =
    typeof showHiddenToggle === 'boolean' || showHiddenToggle === undefined;
  if (!isShowHiddenToggleValid)
    console.error('showHiddenToggle must be a boolean or undefined.');

  return (
    isAuthTokenValid &&
    isIdValid &&
    isLabelValid &&
    isCanCopyValid &&
    isDefaultHiddenValid &&
    isShowHiddenToggleValid
  );
};

export default arePropsValid;
