import request from '@onefootprint/request';
import type { CreateTokenRequest, CreateTokenResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSession, { type AuthHeaders } from 'src/hooks/use-session';

const generateTokenRequest = async (authHeaders: AuthHeaders, { entityId, ...data }: CreateTokenRequest) => {
  const response = await request<CreateTokenResponse>({
    method: 'POST',
    url: `/entities/${entityId}/token`,
    data,
    headers: authHeaders,
  });
  return response.data;
};

const useGenerateTokenRequest = () => {
  const { authHeaders } = useSession();

  return useMutation({
    mutationFn: (data: CreateTokenRequest) => generateTokenRequest(authHeaders, data),
  });
};

export default useGenerateTokenRequest;
