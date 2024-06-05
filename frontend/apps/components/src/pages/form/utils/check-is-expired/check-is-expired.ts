import { getLogger } from '@onefootprint/idv';

const { logWarn, logTrack } = getLogger({ location: 'check-is-expired' });

const checkIsExpired = (expiresAt?: Date) => {
  if (!expiresAt) {
    logTrack('Client token does not have an expiration date');
    return false;
  }

  const now = new Date();
  const isExpired = now > expiresAt;
  if (isExpired) {
    logWarn('Client token has expired. Please generate a new one', undefined, {
      now: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });
  }
  return isExpired;
};

export default checkIsExpired;
