import { createUseRouterSpy, customRenderHook } from '@onefootprint/test-utils';

import useParseHandoffUrl from './use-parse-handoff-url';

const useRouterSpy = createUseRouterSpy();

describe('useParseHandoffUrl', () => {
  describe('when URL has an authToken', () => {
    it('should call onSuccess with authToken', () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();
      useRouterSpy({
        pathname: '/some-path',
        asPath: '/some-path#testToken',
      });

      customRenderHook(() => useParseHandoffUrl({ onSuccess, onError }));

      expect(onSuccess).toHaveBeenCalledWith('testToken');
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('when URL does not have an authToken', () => {
    it('should not call onSuccess or onError', () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();
      useRouterSpy({
        pathname: '/some-path',
        asPath: '/some-path',
      });

      customRenderHook(() => useParseHandoffUrl({ onSuccess, onError }));

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('when authToken in the URL cannot be decoded', () => {
    it('should call onError', () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();
      useRouterSpy({
        asPath: '/some-path#%E0%A4%A',
      });

      customRenderHook(() => useParseHandoffUrl({ onSuccess, onError }));

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    });
  });
});
