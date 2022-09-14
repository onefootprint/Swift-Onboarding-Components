import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import { OrgAuthMagicLinkRequest, OrgAuthMagicLinkResponse } from 'types';

const loginEmailRequest = async (payload: OrgAuthMagicLinkRequest) => {
  const response = await request<OrgAuthMagicLinkResponse>({
    method: 'POST',
    url: '/org/auth/magic_link',
    data: payload,
  });
  return response.data;
};

const useLoginEmail = () =>
  useMutation<OrgAuthMagicLinkResponse, RequestError, OrgAuthMagicLinkRequest>(
    loginEmailRequest,
  );

export default useLoginEmail;
