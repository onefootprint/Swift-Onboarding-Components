import { renderHook } from 'test-utils';

import { BifrostMachineProvider } from '../../components/bifrost-machine-provider';
import bifrostMachine from '../../utils/state-machine/bifrost';
import useSandboxMode from './use-sandbox-mode';

describe('useSandboxMode', () => {
  describe('when it is using a live key', () => {
    it('should return false', () => {
      bifrostMachine.context.tenant.isLive = true;
      const { result } = renderHook(() => useSandboxMode(), {
        wrapper: BifrostMachineProvider,
      });
      expect(result.current.isSandbox).toBeFalsy();
    });
  });

  describe('when it is using a sandbox key', () => {
    it('should return false', () => {
      bifrostMachine.context.tenant.isLive = false;
      const { result } = renderHook(() => useSandboxMode(), {
        wrapper: BifrostMachineProvider,
      });
      expect(result.current.isSandbox).toBeTruthy();
    });
  });
});
