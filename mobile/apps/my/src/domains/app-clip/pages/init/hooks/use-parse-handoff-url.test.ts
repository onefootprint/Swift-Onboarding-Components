import { renderHook } from '@onefootprint/test-utils';

import useParseHandoffUrl from './use-parse-handoff-url';
import mockUrl from './use-parse-handoff-url.test.config';

jest.mock('expo-linking', () => ({
  __esModule: true,
  ...jest.requireActual('expo-linking'),
}));

describe('useParseHandoffUrl', () => {
  describe('when its a valid URL', () => {
    it('should retrieve the authentication token', () => {
      mockUrl('https://handoff.preview.onefootprint.com/?r=75#tok_ze124412421');
      const callbacks = { onSuccess: jest.fn(), onError: jest.fn() };
      renderHook(() => useParseHandoffUrl(callbacks));
      expect(callbacks.onSuccess).toHaveBeenCalledWith('tok_ze124412421');
    });
  });

  describe('when its an invalid URL', () => {
    it('should trigger an onError event', () => {
      mockUrl('https://handoff.preview.onefootprint.com');
      const callbacks = { onSuccess: jest.fn(), onError: jest.fn() };
      renderHook(() => useParseHandoffUrl(callbacks));
      expect(callbacks.onError).toHaveBeenCalled();
    });
  });
});
