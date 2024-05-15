import type { FootprintFormDataProps } from '@onefootprint/footprint-js';
import { isObject, LoggerDeprecated } from '@onefootprint/idv';

const arePropsValid = (
  props?: Record<string, unknown>,
): props is FootprintFormDataProps => {
  if (!props || !isObject(props)) {
    LoggerDeprecated.error('Received empty props');
    return false;
  }

  const { authToken, title } = props;

  const isAuthTokenValid = typeof authToken === 'string' && !!authToken;
  if (!isAuthTokenValid)
    LoggerDeprecated.error('Valid auth token is required.');

  const isTitleValid = typeof title === 'string' || title === undefined;
  if (!isTitleValid)
    LoggerDeprecated.error('Title must be a string or undefined.');

  return isAuthTokenValid && isTitleValid;
};

export default arePropsValid;
