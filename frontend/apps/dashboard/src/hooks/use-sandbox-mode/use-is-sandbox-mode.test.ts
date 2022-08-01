import { act, renderHook } from 'test-utils';

import { useStore } from '../use-session-user';
import useIsSandbox from './use-sandbox-mode';

const originalState = useStore.getState();

describe('useIsSandbox', () => {
  afterAll(() => {
    useStore.setState(originalState);
  });

  describe('when it is using a live key', () => {
    beforeEach(() => {
      useStore.setState({
        isLive: true,
      });
    });

    it('should return false', () => {
      const { result } = renderHook(() => useIsSandbox());
      const [value] = result.current;
      expect(value).toBeFalsy();
    });
  });

  describe('when it is using a sandbox key', () => {
    beforeEach(() => {
      useStore.setState({
        isLive: false,
      });
    });

    it('should return false', () => {
      const { result } = renderHook(() => useIsSandbox());
      const [value] = result.current;
      expect(value).toBeTruthy();
    });
  });

  describe('when toggling', () => {
    beforeEach(() => {
      useStore.setState({
        isLive: false,
      });
    });

    it('should toggle the value', () => {
      const { result } = renderHook(() => useIsSandbox());
      const [initialValue, toggle] = result.current;
      expect(initialValue).toBeTruthy();
      act(() => {
        toggle();
      });
      const [nextValue] = result.current;
      expect(nextValue).toBeFalsy();
    });
  });
});
