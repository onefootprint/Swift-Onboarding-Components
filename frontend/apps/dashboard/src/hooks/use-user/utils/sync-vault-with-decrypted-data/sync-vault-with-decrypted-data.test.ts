import { IdDocDataAttribute, UserDataAttribute } from '@onefootprint/types';

import syncVaultWithDecryptedData from './sync-vault-with-decrypted-data';

describe('syncVaultWithDecryptedData', () => {
  it('when decrypting data for the first time', () => {
    const vaultData = syncVaultWithDecryptedData(
      {
        [UserDataAttribute.addressLine1]: '123 Summer St',
        [UserDataAttribute.city]: 'Boston',
      },
      {
        kycData: {},
        idDoc: {},
      },
    );

    expect(vaultData).toStrictEqual({
      kycData: {
        [UserDataAttribute.addressLine1]: '123 Summer St',
        [UserDataAttribute.city]: 'Boston',
      },
      idDoc: {},
    });
  });

  it('when decrypting new data', () => {
    const vaultData = syncVaultWithDecryptedData(
      {
        [UserDataAttribute.addressLine1]: '123 Summer St',
        [UserDataAttribute.city]: 'Boston',
      },
      {
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
        },
        idDoc: {
          [IdDocDataAttribute.frontImage]: 'image',
        },
      },
    );

    expect(vaultData).toStrictEqual({
      kycData: {
        [UserDataAttribute.firstName]: 'Piip',
        [UserDataAttribute.lastName]: 'Footprint',
        [UserDataAttribute.addressLine1]: '123 Summer St',
        [UserDataAttribute.city]: 'Boston',
      },
      idDoc: {
        [IdDocDataAttribute.frontImage]: 'image',
      },
    });
  });

  it('when data is empty', () => {
    const vaultData = syncVaultWithDecryptedData(
      {},
      {
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
        },
        idDoc: {},
      },
    );

    expect(vaultData).toStrictEqual({
      kycData: {
        [UserDataAttribute.firstName]: 'Piip',
        [UserDataAttribute.lastName]: 'Footprint',
      },
      idDoc: {},
    });
  });

  it('when vaultData is empty', () => {
    const vaultData = syncVaultWithDecryptedData(
      {
        [UserDataAttribute.firstName]: 'Piip',
        [UserDataAttribute.lastName]: 'Footprint',
      },
      undefined,
    );

    expect(vaultData).toStrictEqual({
      kycData: {
        [UserDataAttribute.firstName]: 'Piip',
        [UserDataAttribute.lastName]: 'Footprint',
      },
      idDoc: {},
    });
  });
});
