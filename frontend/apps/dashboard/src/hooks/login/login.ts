import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';

export type LoginResponse = {
  email: string;
  auth: string;
  firstName?: string;
  lastName?: string;
};

const login = async (code: string) => {
  const { data: response } = await request<RequestResponse<LoginResponse>>({
    method: 'GET',
    url: '/auth/login',
    params: { code },
  });
  return response.data;
};
const useLogin = () => useMutation<LoginResponse, RequestError, string>(login);

export default useLogin;
