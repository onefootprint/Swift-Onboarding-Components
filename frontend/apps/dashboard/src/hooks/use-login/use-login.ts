import { OrgAuthLoginRequest, OrgAuthLoginResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';

const login = async (code: string) => {
  const response = await request<OrgAuthLoginResponse>({
    method: 'POST',
    url: '/org/auth/login',
    data: { code },
  });
  return response.data;
};

const useLogin = () =>
  useMutation<OrgAuthLoginResponse, RequestError, OrgAuthLoginRequest>(login);

export default useLogin;
