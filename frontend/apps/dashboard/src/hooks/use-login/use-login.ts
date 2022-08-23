import { useMutation } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';

export type LoginResponse = {
  auth: string;
  email: string;
  firstName: string;
  lastName: string;
  newTenant: boolean;
  sandboxRestricted: boolean;
  tenantName: string;
};

const login = async (code: string) => {
  const { data: response } = await request<RequestResponse<LoginResponse>>({
    method: 'POST',
    url: '/org/auth/login',
    data: { code },
  });
  return response.data;
};

const useLogin = () => useMutation<LoginResponse, RequestError, string>(login);

export default useLogin;
