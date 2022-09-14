import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import { OrgAuthLoginRequest, OrgAuthLoginResponse } from 'types';

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
