import {
  OrgAuthMagicLinkRequest,
  OrgAuthMagicLinkResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';

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
