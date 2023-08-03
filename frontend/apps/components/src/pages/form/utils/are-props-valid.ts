/* eslint-disable no-console */
import { FootprintFormType } from '@onefootprint/footprint-js';

import { FootprintFormDataProps } from '../types';

const isObject = (obj: any) => typeof obj === 'object';

const arePropsValid = (
  props?: Record<string, any>,
): props is FootprintFormDataProps => {
  if (!props || !isObject(props)) {
    console.error('Received empty props');
    return false;
  }

  const { authToken, title, type, variant } = props;

  const isAuthTokenValid = typeof authToken === 'string' && !!authToken;
  if (!isAuthTokenValid) console.error('Valid auth token is required.');

  const isTitleValid = typeof title === 'string' || title === undefined;
  if (!isTitleValid) console.error('Title must be a string or undefined.');

  const isTypeValid =
    type === undefined ||
    Object.values(FootprintFormType).includes(type as FootprintFormType);
  if (!isTypeValid)
    console.error(
      `Form type has to be one of ${Object.values(FootprintFormType).join(
        ', ',
      )} but received: ${type}`,
    );

  const isVariantValid =
    variant === undefined ||
    variant === 'inline' ||
    variant === 'drawer' ||
    variant === 'modal';
  if (!isVariantValid)
    console.error(
      'Form variant has to be one of modal, drawer or inline, received: ',
      variant,
    );

  return isAuthTokenValid && isTitleValid && isTypeValid && isVariantValid;
};

export default arePropsValid;
