import { beforeEach, describe, expect, it, jest } from 'bun:test';

import getSessionId from './session-id';

describe('getSessionId', () => {
  describe('when sessionStorage is available', () => {
    beforeEach(() => {
      Object.defineProperty(global, 'sessionStorage', {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });
    });

    it('should store session id in sessionStorage', () => {
      const sessionId = getSessionId();
      expect(global.sessionStorage.setItem).toHaveBeenCalledWith('fp-session-id', sessionId);
    });

    it('should retrieve session id from sessionStorage', () => {
      const sessionId = getSessionId();
      // @ts-ignore
      global.sessionStorage.getItem.mockReturnValueOnce(sessionId);
      const sessionId2 = getSessionId();
      expect(sessionId).toEqual(sessionId2);
    });
  });

  describe('when sessionStorage is not available', () => {
    beforeEach(() => {
      Object.defineProperty(global, 'sessionStorage', {
        value: undefined,
        writable: true,
      });
    });

    it('should return a session id even if sessionStorage is not available', () => {
      const sessionId = getSessionId();
      expect(typeof sessionId).toBe('string');
    });

    it('should not throw an error when sessionStorage is not available', () => {
      expect(() => getSessionId()).not.toThrow();
    });
  });
});
