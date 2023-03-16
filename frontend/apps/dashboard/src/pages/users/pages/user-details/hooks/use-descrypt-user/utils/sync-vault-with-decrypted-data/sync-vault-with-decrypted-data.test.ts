import {
  DecryptedIdDocStatus,
  IdDocType,
  UserDataAttribute,
} from '@onefootprint/types';

import syncVaultWithDecryptedData from './sync-vault-with-decrypted-data';

describe('syncVaultWithDecryptedData', () => {
  it('when decrypting data for the first time', () => {
    const vaultData = syncVaultWithDecryptedData(
      {
        kycData: {
          [UserDataAttribute.addressLine1]: '123 Summer St',
          [UserDataAttribute.city]: 'Boston',
        },
        idDoc: {},
        investorProfile: {},
      },
      {
        kycData: {},
        idDoc: {},
        investorProfile: {},
      },
    );

    expect(vaultData).toStrictEqual({
      kycData: {
        [UserDataAttribute.addressLine1]: '123 Summer St',
        [UserDataAttribute.city]: 'Boston',
      },
      idDoc: {},
      investorProfile: {},
    });
  });

  it('when decrypting new data', () => {
    const vaultData = syncVaultWithDecryptedData(
      {
        kycData: {
          [UserDataAttribute.addressLine1]: '123 Summer St',
          [UserDataAttribute.city]: 'Boston',
        },
        idDoc: {
          [IdDocType.driversLicense]: [
            {
              front: 'image',
              uploadedAt: 'date',
              status: DecryptedIdDocStatus.success,
            },
          ],
        },
        investorProfile: {},
      },
      {
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
        },
        idDoc: {
          [IdDocType.passport]: [
            {
              front: 'image',
              uploadedAt: 'date',
              status: DecryptedIdDocStatus.success,
            },
          ],
        },
        investorProfile: {},
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
        [IdDocType.driversLicense]: [
          {
            front: 'image',
            uploadedAt: 'date',
            status: DecryptedIdDocStatus.success,
          },
        ],
        [IdDocType.passport]: [
          {
            front: 'image',
            uploadedAt: 'date',
            status: DecryptedIdDocStatus.success,
          },
        ],
      },
      investorProfile: {},
    });
  });

  it('when data is empty', () => {
    const vaultData = syncVaultWithDecryptedData(
      {
        kycData: {},
        idDoc: {},
        investorProfile: {},
      },
      {
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
        },
        idDoc: {},
        investorProfile: {},
      },
    );

    expect(vaultData).toStrictEqual({
      kycData: {
        [UserDataAttribute.firstName]: 'Piip',
        [UserDataAttribute.lastName]: 'Footprint',
      },
      idDoc: {},
      investorProfile: {},
    });
  });

  it('when vaultData is empty', () => {
    const vaultData = syncVaultWithDecryptedData(
      {
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
        },
        idDoc: {},
        investorProfile: {},
      },
      undefined,
    );

    expect(vaultData).toStrictEqual({
      kycData: {
        [UserDataAttribute.firstName]: 'Piip',
        [UserDataAttribute.lastName]: 'Footprint',
      },
      idDoc: {},
      investorProfile: {},
    });
  });
});
