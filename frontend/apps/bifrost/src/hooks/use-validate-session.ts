import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import type {
  ValidateSessionRequest,
  ValidateSessionResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { AUTH_HEADER } from 'src/config/constants';

const validateSession = async (payload: ValidateSessionRequest) => {
  const { data: response } = await request<ValidateSessionResponse>({
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
    onSuccess: (response: ValidateSessionResponse) => void;
    onError?: (error: RequestError) => void;
  },
) =>
  useQuery(['validate'], () => validateSession(payload), {
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    onSuccess: options.onSuccess,
    onError: options.onError,
  });

export default useValidateSession;
