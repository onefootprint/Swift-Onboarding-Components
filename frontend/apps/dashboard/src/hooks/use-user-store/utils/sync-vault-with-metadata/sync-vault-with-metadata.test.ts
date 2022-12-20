import {
  IdDocType,
  OnboardingStatus,
  UserDataAttribute,
} from '@onefootprint/types';
import { UserMetadata, UserVaultData } from 'src/hooks/use-user/types';

import syncVaultWithMetadata from './sync-vault-with-metadata';

describe('syncVaultWithMetadata', () => {
  it('when initializing vault data for the first time', () => {
    const metadata: UserMetadata = {
      requiresManualReview: false,
      status: OnboardingStatus.failed,
      id: 'u1',
      isPortable: true,
      identityDataAttributes: [
        UserDataAttribute.firstName,
        UserDataAttribute.lastName,
      ],
      identityDocumentTypes: [IdDocType.passport, IdDocType.driversLicense],
      startTimestamp: 'time',
      orderingId: 'id',
    };

    const vaultData: UserVaultData = {
      kycData: {
        [UserDataAttribute.firstName]: null,
      },
      idDoc: {
        [IdDocType.passport]: null,
      },
    };

    const syncedVaultData = syncVaultWithMetadata(metadata, vaultData);
    expect(syncedVaultData).toStrictEqual({
      kycData: {
        [UserDataAttribute.firstName]: null,
        [UserDataAttribute.lastName]: null,
      },
      idDoc: {
        [IdDocType.passport]: null,
        [IdDocType.driversLicense]: null,
      },
    });
  });

  it('when metadata has new fields', () => {
    const metadata: UserMetadata = {
      requiresManualReview: false,
      status: OnboardingStatus.failed,
      id: 'u1',
      isPortable: true,
      identityDataAttributes: [
        UserDataAttribute.firstName,
        UserDataAttribute.lastName,
      ],
      identityDocumentTypes: [IdDocType.passport],
      startTimestamp: 'time',
      orderingId: 'id',
    };

    const vaultData: UserVaultData = {
      kycData: {},
      idDoc: {},
    };

    const syncedVaultData = syncVaultWithMetadata(metadata, vaultData);
    expect(syncedVaultData).toStrictEqual({
      kycData: {
        [UserDataAttribute.firstName]: null,
        [UserDataAttribute.lastName]: null,
      },
      idDoc: {
        [IdDocType.passport]: null,
      },
    });
  });

  it('when vault data has decrypted fields', () => {
    const metadata: UserMetadata = {
      requiresManualReview: false,
      status: OnboardingStatus.failed,
      id: 'u1',
      isPortable: true,
      identityDataAttributes: [
        UserDataAttribute.firstName,
        UserDataAttribute.lastName,
        UserDataAttribute.addressLine1,
        UserDataAttribute.addressLine2,
      ],
      identityDocumentTypes: [IdDocType.passport, IdDocType.driversLicense],
      startTimestamp: 'time',
      orderingId: 'id',
    };

    const vaultData: UserVaultData = {
      kycData: {
        [UserDataAttribute.firstName]: 'Piip',
        [UserDataAttribute.addressLine1]: '123 Summer St',
      },
      idDoc: {
        [IdDocType.passport]: [{ front: 'image' }],
      },
    };

    const syncedVaultData = syncVaultWithMetadata(metadata, vaultData);
    expect(syncedVaultData).toStrictEqual({
      kycData: {
        [UserDataAttribute.firstName]: 'Piip',
        [UserDataAttribute.lastName]: null,
        [UserDataAttribute.addressLine1]: '123 Summer St',
        [UserDataAttribute.addressLine2]: null,
      },
      idDoc: {
        [IdDocType.passport]: [{ front: 'image' }],
        [IdDocType.driversLicense]: null,
      },
    });
  });
});
