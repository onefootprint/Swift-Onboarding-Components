import type { FootprintFormDataProps } from '@onefootprint/footprint-js';
import { Logger } from '@onefootprint/idv-elements';

const isObject = (obj: unknown) => typeof obj === 'object';

const arePropsValid = (
  props?: Record<string, unknown>,
): props is FootprintFormDataProps => {
  if (!props || !isObject(props)) {
    Logger.error('Received empty props');
    return false;
  }

  const { authToken, title } = props;

  const isAuthTokenValid = typeof authToken === 'string' && !!authToken;
  if (!isAuthTokenValid) Logger.error('Valid auth token is required.');

  const isTitleValid = typeof title === 'string' || title === undefined;
  if (!isTitleValid) Logger.error('Title must be a string or undefined.');

  return isAuthTokenValid && isTitleValid;
};

export default arePropsValid;
