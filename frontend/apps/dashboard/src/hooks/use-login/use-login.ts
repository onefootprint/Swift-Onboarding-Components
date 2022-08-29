import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';

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
  const response = await request<LoginResponse>({
    method: 'POST',
    url: '/org/auth/login',
    data: { code },
  });
  return response.data;
};

const useLogin = () => useMutation<LoginResponse, RequestError, string>(login);

export default useLogin;
