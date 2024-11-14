import { customRenderHook, screen, waitFor } from '@onefootprint/test-utils';
import type { CollectKycDataRequirement, PublicOnboardingConfig } from '@onefootprint/types';
import { CollectedKycDataOption, IdDI, OnboardingConfigStatus, OnboardingRequirementKind } from '@onefootprint/types';

import type { DeviceInfo } from '../../../../hooks';
import type { KycData } from '../../utils/data-types';
import useSyncData from './use-sync-data';
import { getCustomWrapper, withUserVault, withUserVaultError } from './use-sync-data.test.utils';

describe('useSyncData', () => {
  const testDevice: DeviceInfo = {
    type: 'mobile',
    hasSupportForWebauthn: false,
    osName: 'unknown',
    browser: 'Safari',
  };

  const testConfig: PublicOnboardingConfig = {
    isLive: true,
    logoUrl: 'url',
    privacyPolicyUrl: 'url',
    name: 'tenant',
    orgName: 'tenantOrg',
    orgId: 'orgId',
    status: OnboardingConfigStatus.enabled,
    isAppClipEnabled: false,
    isInstantAppEnabled: false,
    appClipExperienceId: 'app_exp_9KlTyouGLSNKMgJmpUdBAF',
    isNoPhoneFlow: false,
    requiresIdDoc: false,
    key: 'key',
    isKyb: false,
    allowInternationalResidents: false,
  };

  const testRequirement: CollectKycDataRequirement = {
    kind: OnboardingRequirementKind.collectKycData,
    isMet: false,
    missingAttributes: [CollectedKycDataOption.dob, CollectedKycDataOption.address],
    populatedAttributes: [CollectedKycDataOption.name],
    optionalAttributes: [CollectedKycDataOption.ssn4],
    recollectAttributes: [],
  };

  const testInitialData: KycData = {};

  const dirtyData: KycData = {
    [IdDI.firstName]: {
      value: 'John',
      decrypted: true,
    },
    [IdDI.lastName]: {
      value: 'Doe',
      decrypted: true,
    },
    [IdDI.dob]: {
      value: '05/24/1996',
    },
    [IdDI.addressLine1]: {
      value: '123 Main St',
      dirty: true,
    },
    [IdDI.city]: {
      value: 'Anytown',
      bootstrap: true,
    },
    [IdDI.state]: {
      value: 'NY',
    },
    [IdDI.zip]: {
      value: '12345',
      dirty: true,
    },
    [IdDI.country]: {
      value: 'US',
    },
  };

  const cleanedData = {
    [IdDI.firstName]: {
      value: 'John',
      decrypted: false,
      scrubbed: false,
      bootstrap: false,
      dirty: false,
    },
    [IdDI.lastName]: {
      value: 'Doe',
      decrypted: false,
      scrubbed: false,
      bootstrap: false,
      dirty: false,
    },
    [IdDI.dob]: {
      value: '05/24/1996',
      decrypted: false,
      scrubbed: false,
      bootstrap: false,
      dirty: false,
    },
    [IdDI.addressLine1]: {
      value: '123 Main St',
      decrypted: false,
      scrubbed: false,
      bootstrap: false,
      dirty: false,
    },
    [IdDI.city]: {
      value: 'Anytown',
      decrypted: false,
      scrubbed: false,
      bootstrap: false,
      dirty: false,
    },
    [IdDI.state]: {
      value: 'NY',
      decrypted: false,
      scrubbed: false,
      bootstrap: false,
      dirty: false,
    },
    [IdDI.zip]: {
      value: '12345',
      decrypted: false,
      scrubbed: false,
      bootstrap: false,
      dirty: false,
    },
    [IdDI.country]: {
      value: 'US',
      decrypted: false,
      scrubbed: false,
      bootstrap: false,
      dirty: false,
    },
  };

  describe('when syncing fails with field errors', () => {
    beforeEach(() => {
      withUserVaultError();
    });

    it('calls onError with field errors from api', async () => {
      const initialContext = {
        authToken: 'tok_123',
        device: testDevice,
        config: testConfig,
        requirement: testRequirement,
        data: {},
        initialData: testInitialData,
      };
      const { result } = customRenderHook(() => useSyncData(), getCustomWrapper(initialContext));
      const { syncData } = result.current;
      const onSuccess = jest.fn();
      const onError = jest.fn();

      await syncData({ data: dirtyData, onSuccess, onError });
      await waitFor(() => {
        expect(onSuccess).not.toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith({
          [IdDI.addressLine1]: 'Invalid addr line 1',
          [IdDI.state]: 'Invalid state',
        });
      });
    });
  });

  describe('when syncing fails with string error', () => {
    beforeEach(() => {
      withUserVaultError('custom error');
    });

    it('calls onError with string error from api', async () => {
      const initialContext = {
        authToken: 'tok_123',
        device: testDevice,
        config: testConfig,
        requirement: testRequirement,
        data: {},
        initialData: testInitialData,
      };
      const { result } = customRenderHook(() => useSyncData(), getCustomWrapper(initialContext));
      const { syncData } = result.current;
      const onSuccess = jest.fn();
      const onError = jest.fn();

      await syncData({ data: dirtyData, onSuccess, onError });
      await waitFor(() => {
        expect(onSuccess).not.toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(screen.getByText('custom error')).toBeInTheDocument();
      });
    });
  });

  describe('when syncing succeeds', () => {
    beforeEach(() => {
      withUserVault();
    });

    it('calls onSuccess with cleaned data', async () => {
      const initialContext = {
        authToken: 'tok_123',
        device: testDevice,
        config: testConfig,
        requirement: testRequirement,
        data: {},
        initialData: testInitialData,
      };
      const { result } = customRenderHook(() => useSyncData(), getCustomWrapper(initialContext));
      const { syncData } = result.current;
      const onSuccess = jest.fn();
      const onError = jest.fn();

      // Should not include already populated attributes
      await syncData({ data: dirtyData, onSuccess, onError });
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(cleanedData);
      });
      await waitFor(() => {
        expect(onError).not.toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(screen.queryByText('An error occurred')).toBeNull();
      });
    });
  });
});
