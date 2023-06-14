import { VaultEmptyData, VaultEncryptedData, VaultTextData } from './vault';

type VaultValue = VaultTextData | VaultEncryptedData | VaultEmptyData;

export type EntityCard = {
  name: VaultValue;
  alias: VaultValue;
  issuer: VaultValue;
  number: {
    last4: VaultValue;
  };
  expiration: {
    month: VaultValue;
    year: VaultValue;
  };
};
