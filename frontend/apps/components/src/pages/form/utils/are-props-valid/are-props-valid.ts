import type { FootprintFormDataProps } from '@onefootprint/footprint-js';
import { getLogger, isObject } from '@onefootprint/idv';

const { logError } = getLogger({ location: 'are-props-valid' });

const arePropsValid = (props?: Record<string, unknown>): props is FootprintFormDataProps => {
  if (!props || !isObject(props)) {
    logError('Received empty props');
    return false;
  }

  const { authToken, title } = props;

  const isAuthTokenValid = typeof authToken === 'string' && !!authToken;
  const isTitleValid = typeof title === 'string' || title === undefined;

  if (!isAuthTokenValid) logError('Valid auth token is required.');
  if (!isTitleValid) logError('Title must be a string or undefined.');

  return isAuthTokenValid && isTitleValid;
};

export default arePropsValid;
