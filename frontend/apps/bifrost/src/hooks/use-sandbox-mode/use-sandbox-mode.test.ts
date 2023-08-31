import { renderHook } from '@onefootprint/test-utils';
import {
  OnboardingConfigStatus,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import { BifrostMachine } from 'src/utils/state-machine';

import { BifrostMachineProvider } from '../../components/bifrost-machine-provider';
import useSandboxMode from './use-sandbox-mode';

describe('useSandboxMode', () => {
  const getOnboardingConfig = (isLive: boolean): PublicOnboardingConfig => ({
    isLive,
    key: 'key',
    logoUrl: 'url',
    privacyPolicyUrl: 'url',
    name: 'tenant',
    orgName: 'tenantOrg',
    status: OnboardingConfigStatus.enabled,
    isAppClipEnabled: false,
    isNoPhoneFlow: false,
    requiresIdDoc: false,
    isKyb: false,
    allowInternationalResidents: false,
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
