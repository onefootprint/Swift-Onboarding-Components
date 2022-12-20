import request from '@onefootprint/request';
import { OrgAuthLoginResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const login = async (code: string) => {
  const response = await request<OrgAuthLoginResponse>({
    method: 'POST',
    url: '/org/auth/login',
    data: { code },
  });
  return response.data;
};

const useLogin = () => useMutation(login);

export default useLogin;
