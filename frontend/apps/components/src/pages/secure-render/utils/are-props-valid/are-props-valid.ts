/* eslint-disable no-console */
import { SecureRenderDataProps } from '@onefootprint/footprint-components-js';

import isValidDI from '../is-valid-di';

const isObject = (obj: any) => typeof obj === 'object';

const arePropsValid = (
  props?: Record<string, any>,
): props is SecureRenderDataProps => {
  if (!props || !isObject(props)) {
    console.error('Received empty props');
    return false;
  }

  const { authToken, id, label, canCopy, isHidden } = props;

  const isAuthTokenValid = typeof authToken === 'string' && !!authToken;
  if (!isAuthTokenValid) console.error('Valid auth token is required.');

  const isIdValid = typeof id === 'string' && !!id && isValidDI(id);
  if (!isIdValid)
    console.error('Id has to be a valid data identifier, received: ', id);

  const isLabelValid = typeof label === 'string' || label === undefined;
  if (!isLabelValid) console.error('Label must be a string or undefined.');

  const isCanCopyValid = typeof canCopy === 'boolean' || canCopy === undefined;
  if (!isCanCopyValid) console.error('canCopy must be a boolean or undefined.');

  const isIsHiddenValid =
    typeof isHidden === 'boolean' || isHidden === undefined;
  if (!isIsHiddenValid)
    console.error('isHidden must be a boolean or undefined.');

  return (
    isAuthTokenValid &&
    isIdValid &&
    isLabelValid &&
    isCanCopyValid &&
    isIsHiddenValid
  );
};

export default arePropsValid;
