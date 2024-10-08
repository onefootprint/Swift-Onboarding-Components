import type { VaultEmptyData, VaultEncryptedData, VaultTextData } from './vault';

type VaultValue = VaultTextData | VaultEncryptedData | VaultEmptyData;

export type EntityBankAccount = {
  alias: VaultValue;
  name: VaultValue;
  accountType: VaultValue;
  routingNumber: VaultValue;
  accountNumber: VaultValue;
  accountId: VaultValue;
  fingerprint: VaultValue;
};
