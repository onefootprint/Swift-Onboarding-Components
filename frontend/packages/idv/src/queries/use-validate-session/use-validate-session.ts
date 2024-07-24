import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { ValidateSessionRequest } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

const validateSession = async (payload: ValidateSessionRequest) => {
  const { data: response } = await request<string>({
    method: 'GET',
    url: '/hosted/check_session',
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response;
};

const useValidateSession = (
  payload: ValidateSessionRequest,
  options: {
    onSuccess: (response: string) => void;
    onError?: (error: RequestError) => void;
  },
) =>
  useQuery(['validate'], () => validateSession(payload), {
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    onSuccess: options.onSuccess,
    onError: options.onError,
    enabled: !!payload.authToken,
  });

export default useValidateSession;
