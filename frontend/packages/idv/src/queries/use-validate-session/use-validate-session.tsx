import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { ValidateSessionRequest } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

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
    onSuccess?: (response: string) => void;
    onError?: (error: RequestError) => void;
  } = {},
) => {
  const query = useQuery({
    queryKey: ['validate', payload.authToken],
    queryFn: () => validateSession(payload),
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    enabled: !!payload.authToken,
  });

  useEffect(() => {
    if (query.isSuccess && options.onSuccess) {
      options.onSuccess(query.data);
    }
    if (query.isError && options.onError) {
      options.onError(query.error as RequestError);
    }
    // no onSuccess or onError because likely to trigger infinite re-render/loop
  }, [query.isSuccess, query.isError, query.data, query.error]);

  return query;
};

export default useValidateSession;
