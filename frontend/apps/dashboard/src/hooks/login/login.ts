import { useMutation } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';

export type LoginResponse = {
  email: string;
  auth: string;
  firstName?: string;
  lastName?: string;
  newTenant: boolean;
  tenantName: string;
  sandboxRestricted: boolean;
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
