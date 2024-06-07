import { renderHook } from '@testing-library/react';

import type { RequestError } from './request';
import { getErrorMessage as getErrorMessageStandAlone, useRequestError } from './request';

describe('@onefootprint/request', () => {
  describe('getErrorMessage', () => {
    it('should return the error message 1/3', () => {
      const error = {
        response: {
          data: {
            error: {
              message: 'error message',
            },
          },
        },
      };

      expect(getErrorMessageStandAlone(error as RequestError)).toBe('error message');
    });

    it('should return the error message 2/3', () => {
      const error = {
        code: null,
        message: {
          error: 'Message delivery failed. Please try resending the message or use a different phone number.',
        },
        context: null,
        status_code: 400,
        support_id: '8214a664-4fba-4f24-af69-3363886b729d',
      } as unknown as RequestError;

      expect(getErrorMessageStandAlone(error as RequestError)).toBe(
        'Message delivery failed. Please try resending the message or use a different phone number.',
      );
    });

    it('should return the error message 3/3', () => {
      const error = {
        code: null,
        message: {
          error: {
            error: {
              error: {
                error: {
                  error: 'Message delivery failed. Please try resending the message or use a different phone number.',
                },
              },
            },
          },
        },
        context: null,
        status_code: 400,
        support_id: '8214a664-4fba-4f24-af69-3363886b729d',
      } as unknown as RequestError;

      expect(getErrorMessageStandAlone(error as RequestError)).toBe(
        'Message delivery failed. Please try resending the message or use a different phone number.',
      );
    });

    it('should keep the original error', () => {
      const str = `Fetching onboarding config in bifrost init failed with error: ${getErrorMessageStandAlone(
        new Error('test'),
      )}`;

      expect(str).toBe('Fetching onboarding config in bifrost init failed with error: test');
      expect(getErrorMessageStandAlone(str)).toBe(str);
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
      expect(getErrorMessage(error)).toEqual('Cannot transition status backwards');
    });

    it('should handle unknown types correctly', () => {
      const { result } = renderHook(() => useRequestError());
      const { getErrorMessage, getErrorCode } = result.current;
      expect(getErrorCode('custom')).toEqual(undefined);
      expect(getErrorMessage('custom')).toEqual('custom');

      expect(getErrorCode({})).toEqual(undefined);
      expect(getErrorMessage({})).toEqual('Something went wrong');

      expect(getErrorCode({ response: { data: { error: { code: 'A100' } } } })).toEqual('A100');
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
