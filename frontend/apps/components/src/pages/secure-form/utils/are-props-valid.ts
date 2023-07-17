/* eslint-disable no-console */
import {
  SecureFormProps,
  SecureFormType,
} from '@onefootprint/footprint-components-js';

const isFunction = (fn: any) => typeof fn === 'function';
const isObject = (obj: any) => typeof obj === 'object';

const arePropsValid = (
  props?: Record<string, any>,
): props is SecureFormProps => {
  if (!props || !isObject(props)) {
    console.error('Received empty props');
    return false;
  }

  const {
    authToken,
    cardAlias,
    title,
    type,
    variant,
    onSave,
    onCancel,
    onClose,
  } = props;

  const isAuthTokenValid = typeof authToken === 'string' && !!authToken;
  if (!isAuthTokenValid) console.error('Valid auth token is required.');

  const isCardAliasValid = typeof cardAlias === 'string' && !!cardAlias;
  if (!isCardAliasValid) console.error('Non-empty card alias is required.');

  const isTitleValid = typeof title === 'string' || title === undefined;
  if (!isTitleValid) console.error('Title must be a string or undefined.');

  const isTypeValid =
    type === undefined ||
    Object.values(SecureFormType).includes(type as SecureFormType);
  if (!isTypeValid)
    console.error(
      `Form type has to be one of ${Object.values(SecureFormType).join(
        ', ',
      )} but received: ${type}`,
    );

  const isVariantValid =
    variant === undefined || variant === 'card' || variant === 'modal';
  if (!isVariantValid)
    console.error(
      'Form variant has to be one of modal or card, received: ',
      variant,
    );

  const isOnSaveValid = onSave === undefined || isFunction(onSave);
  if (!isOnSaveValid) console.error('onSave must be a function or undefined.');

  const isOnCancelValid = onCancel === undefined || isFunction(onCancel);
  if (!isOnCancelValid)
    console.error('onCancel must be a function or undefined.');

  const isOnCloseValid = onClose === undefined || isFunction(onClose);
  if (!isOnCloseValid)
    console.error('onClose must be a function or undefined.');

  return (
    isAuthTokenValid &&
    isCardAliasValid &&
    isTitleValid &&
    isTypeValid &&
    isVariantValid &&
    isOnSaveValid &&
    isOnCancelValid &&
    isOnCloseValid
  );
};

export default arePropsValid;
