import {
  IdDocDataAttribute,
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
      identityDocumentTypes: [
        IdDocDataAttribute.frontImage,
        IdDocDataAttribute.backImage,
      ],
      startTimestamp: 'time',
      orderingId: 'id',
    };

    const vaultData: UserVaultData = {
      kycData: {
        [UserDataAttribute.firstName]: null,
      },
      idDoc: {
        [IdDocDataAttribute.frontImage]: null,
      },
    };

    const syncedVaultData = syncVaultWithMetadata(metadata, vaultData);
    expect(syncedVaultData).toStrictEqual({
      kycData: {
        [UserDataAttribute.firstName]: null,
        [UserDataAttribute.lastName]: null,
      },
      idDoc: {
        [IdDocDataAttribute.frontImage]: null,
        [IdDocDataAttribute.backImage]: null,
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
      identityDocumentTypes: [IdDocDataAttribute.frontImage],
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
        [IdDocDataAttribute.frontImage]: null,
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
      identityDocumentTypes: [
        IdDocDataAttribute.frontImage,
        IdDocDataAttribute.selfie,
      ],
      startTimestamp: 'time',
      orderingId: 'id',
    };

    const vaultData: UserVaultData = {
      kycData: {
        [UserDataAttribute.firstName]: 'Piip',
        [UserDataAttribute.addressLine1]: '123 Summer St',
      },
      idDoc: {
        [IdDocDataAttribute.frontImage]: 'image',
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
        [IdDocDataAttribute.frontImage]: 'image',
        [IdDocDataAttribute.selfie]: null,
      },
    });
  });
});
