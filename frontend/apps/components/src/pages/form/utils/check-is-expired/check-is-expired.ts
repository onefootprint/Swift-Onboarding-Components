import { LoggerDeprecated } from '@onefootprint/idv';

const checkIsExpired = (expiresAt?: Date) => {
  if (!expiresAt) {
    return false;
  }

  const now = new Date();
  const isExpired = now > expiresAt;
  if (isExpired) {
    LoggerDeprecated.warn(
      'Client token has expired. Please generate a new one',
    );
  }
  return isExpired;
};

export default checkIsExpired;
