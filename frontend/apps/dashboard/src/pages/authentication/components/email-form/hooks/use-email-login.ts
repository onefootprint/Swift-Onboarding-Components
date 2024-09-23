import request from '@onefootprint/request';
import type { OrgAuthMagicLinkRequest, OrgAuthMagicLinkResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const login = async (payload: OrgAuthMagicLinkRequest) => {
  const response = await request<OrgAuthMagicLinkResponse>({
    method: 'POST',
    url: '/org/auth/magic_link',
    data: payload,
  });
  return response.data;
};

const useEmailLogin = () => useMutation(login);

export default useEmailLogin;
