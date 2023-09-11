import type { RequestError } from './request';
import { getErrorMessage } from './request';

describe('@onefootprint/request', () => {
  describe('getErrorMessage', () => {
    it('should return the error message', () => {
      const error = {
        response: {
          data: {
            error: {
              message: 'error message',
            },
          },
        },
      };

      expect(getErrorMessage(error as RequestError)).toBe('error message');
    });
  });
});
