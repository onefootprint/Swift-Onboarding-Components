import { LoggerDeprecated } from '@onefootprint/idv';

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
    LoggerDeprecated.error('Could not get parse card alias from auth token');
    return null;
  }
};

export default getCardAlias;
