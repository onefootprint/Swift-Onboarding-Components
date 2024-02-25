import { Logger } from '@onefootprint/idv';

const checkIsExpired = (expiresAt?: Date) => {
  if (!expiresAt) {
    return false;
  }

  const now = new Date();
  const isExpired = now > expiresAt;
  if (isExpired) {
    Logger.warn('Client token has expired. Please generate a new one');
  }
  return isExpired;
};

export default checkIsExpired;
