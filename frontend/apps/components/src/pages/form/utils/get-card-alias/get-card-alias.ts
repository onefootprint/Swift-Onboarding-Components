import { getLogger } from '@onefootprint/idv';

const { logError } = getLogger({ location: 'get-card-alias' });

const getCardAlias = (vaultFields?: string[]) => {
  if (!vaultFields?.length) {
    return null;
  }

  const field = vaultFields[0];
  try {
    const fieldParts = field.split('.');
    if (fieldParts.length < 3) {
      return null;
    }
    const [, alias] = fieldParts;
    return alias || null;
  } catch (e) {
    logError('Could not get parse card alias from auth token', e);
    return null;
  }
};

export default getCardAlias;
