import type { BusinessOwnerDecryptedData } from '../../content.types';

const isVaultDataBusinessOwner = (data: unknown): data is BusinessOwnerDecryptedData[] => {
  if (!Array.isArray(data)) {
    return false;
  }

  return data.every(
    item =>
      typeof item.first_name === 'string' &&
      typeof item.last_name === 'string' &&
      typeof item.ownership_stake === 'number',
  );
};

export default isVaultDataBusinessOwner;
