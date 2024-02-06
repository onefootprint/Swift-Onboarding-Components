import { renderHook } from '@testing-library/react';

import type { RequestError } from './request';
import {
  getErrorMessage as getErrorMessageStandAlone,
  useRequestError,
} from './request';

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

      expect(getErrorMessageStandAlone(error as RequestError)).toBe(
        'error message',
      );
    });
  });

  describe('useRequestError', () => {
    it('should return the error code and translated message', () => {
      const error = {
        response: {
          data: {
            error: {
              message: 'error message',
              code: 'E101',
            },
          },
        },
      };

      const { result } = renderHook(() => useRequestError());
      const { getErrorMessage, getErrorCode } = result.current;
      expect(getErrorCode(error)).toEqual('E101');
      expect(getErrorMessage(error)).toEqual(
        'Cannot transition status backwards',
      );
    });

    it('should handle unknown types correctly', () => {
      const { result } = renderHook(() => useRequestError());
      const { getErrorMessage, getErrorCode } = result.current;
      expect(getErrorCode('custom')).toEqual(undefined);
      expect(getErrorMessage('custom')).toEqual('custom');

      expect(getErrorCode({})).toEqual(undefined);
      expect(getErrorMessage({})).toEqual('Something went wrong');

      expect(
        getErrorCode({ response: { data: { error: { code: 'A100' } } } }),
      ).toEqual('A100');
      expect(
        getErrorMessage({
          response: { data: { error: { code: 'blah' } } },
        }),
      ).toEqual('Something went wrong');
    });

    it('should use context while generating error translation', () => {
      const error = {
        response: {
          data: {
            error: {
              message: 'error message',
              code: 'E104',
              context: { seconds: 4 },
            },
          },
        },
      };

      const { result } = renderHook(() => useRequestError());
      const { getErrorMessage, getErrorCode } = result.current;
      expect(getErrorCode(error)).toEqual('E104');
      expect(getErrorMessage(error)).toEqual('Please wait 4 more seconds');
    });
  });
});
