import { renderHook } from '@onefootprint/test-utils';
import { CollectedKycDataOption, TenantInfo } from '@onefootprint/types';

import { BifrostMachineProvider } from '../../components/bifrost-machine-provider';
import bifrostMachine from '../../utils/state-machine/bifrost';
import useSandboxMode from './use-sandbox-mode';

describe('useSandboxMode', () => {
  describe('when it is using a live key', () => {
    it('should return false', () => {
      const tenant: TenantInfo = {
        isLive: true,
        pk: 'key',
        name: 'tenant',
        mustCollectData: [CollectedKycDataOption.name],
        canAccessData: [CollectedKycDataOption.name],
        orgName: 'tenantOrg',
      };
      bifrostMachine.context.tenant = tenant;
      const { result } = renderHook(() => useSandboxMode(), {
        wrapper: BifrostMachineProvider,
      });
      expect(result.current.isSandbox).toBeFalsy();
    });
  });

  describe('when it is using a sandbox key', () => {
    it('should return false', () => {
      const tenant: TenantInfo = {
        isLive: false,
        pk: 'key',
        name: 'tenant',
        mustCollectData: [CollectedKycDataOption.name],
        canAccessData: [CollectedKycDataOption.name],
        orgName: 'tenantOrg',
      };
      bifrostMachine.context.tenant = tenant;
      const { result } = renderHook(() => useSandboxMode(), {
        wrapper: BifrostMachineProvider,
      });
      expect(result.current.isSandbox).toBeTruthy();
    });
  });
});
