import { renderHook } from 'test-utils';

import { BifrostMachineProvider } from '../../components/bifrost-machine-provider';
import bifrostMachine from '../../utils/state-machine/bifrost';
import useIsSandbox from './use-is-sandbox';

describe('useIsSandbox', () => {
  describe('when it is using a live key', () => {
    it('should return false', () => {
      bifrostMachine.context.tenant.isLive = true;
      const { result } = renderHook(() => useIsSandbox(), {
        wrapper: BifrostMachineProvider,
      });
      expect(result.current).toBeFalsy();
    });
  });

  describe('when it is using a sandbox key', () => {
    it('should return false', () => {
      bifrostMachine.context.tenant.isLive = false;
      const { result } = renderHook(() => useIsSandbox(), {
        wrapper: BifrostMachineProvider,
      });
      expect(result.current).toBeTruthy();
    });
  });
});
