import type { VaultEmptyData, VaultEncryptedData, VaultTextData } from './vault';

type VaultValue = VaultTextData | VaultEncryptedData | VaultEmptyData;

export type EntityCard = {
  name: VaultValue;
  alias: VaultValue;
  issuer: VaultValue;
  number: VaultValue;
  number_last4: VaultValue;
  expiration: VaultValue;
  expiration_month: VaultValue;
  expiration_year: VaultValue;
};
