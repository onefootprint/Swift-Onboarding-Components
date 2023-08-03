import { renderHook } from '@onefootprint/test-utils';
import {
  CollectedKycDataOption,
  OnboardingConfig,
  OnboardingConfigStatus,
} from '@onefootprint/types';
import { BifrostMachine } from 'src/utils/state-machine';

import { BifrostMachineProvider } from '../../components/bifrost-machine-provider';
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
    status: OnboardingConfigStatus.enabled,
    mustCollectData: [CollectedKycDataOption.name],
    canAccessData: [CollectedKycDataOption.name],
    isAppClipEnabled: false,
  });

  describe('when it is using a live key', () => {
    it('should return false', () => {
      const config = getOnboardingConfig(true);
      BifrostMachine.context.config = config;
      const { result } = renderHook(() => useSandboxMode(), {
        wrapper: BifrostMachineProvider,
      });
      expect(result.current.isSandbox).toBeFalsy();
    });
  });

  describe('when it is using a sandbox key', () => {
    it('should return false', () => {
      const config = getOnboardingConfig(false);
      BifrostMachine.context.config = config;
      const { result } = renderHook(() => useSandboxMode(), {
        wrapper: BifrostMachineProvider,
      });
      expect(result.current.isSandbox).toBeTruthy();
    });
  });
});
