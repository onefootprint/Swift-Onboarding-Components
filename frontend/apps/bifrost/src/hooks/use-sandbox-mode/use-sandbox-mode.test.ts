import { renderHook } from '@onefootprint/test-utils';
import { CollectedKycDataOption, OnboardingConfig } from '@onefootprint/types';

import { BifrostMachineProvider } from '../../components/bifrost-machine-provider';
import bifrostMachine from '../../utils/state-machine/bifrost';
import useSandboxMode from './use-sandbox-mode';

describe('useSandboxMode', () => {
  const getOnboardingConfig = (isLive: boolean): OnboardingConfig => ({
    isLive,
    createdAt: 'date',
    id: 'id',
    key: 'key',
    logoUrl: 'url',
    privacyPolicyUrl: 'url',
    name: 'tenant',
    orgName: 'tenantOrg',
    status: 'enabled',
    mustCollectData: [CollectedKycDataOption.name],
    mustCollectIdentityDocument: false,
    mustCollectSelfie: false,
    canAccessData: [CollectedKycDataOption.name],
    canAccessIdentityDocumentImages: false,
    canAccessSelfieImage: false,
  });

  describe('when it is using a live key', () => {
    it('should return false', () => {
      const config = getOnboardingConfig(true);
      bifrostMachine.context.config = config;
      const { result } = renderHook(() => useSandboxMode(), {
        wrapper: BifrostMachineProvider,
      });
      expect(result.current.isSandbox).toBeFalsy();
    });
  });

  describe('when it is using a sandbox key', () => {
    it('should return false', () => {
      const config = getOnboardingConfig(false);
      bifrostMachine.context.config = config;
      const { result } = renderHook(() => useSandboxMode(), {
        wrapper: BifrostMachineProvider,
      });
      expect(result.current.isSandbox).toBeTruthy();
    });
  });
});
