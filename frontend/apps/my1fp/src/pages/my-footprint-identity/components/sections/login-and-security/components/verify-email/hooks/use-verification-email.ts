import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import { MY1FP_AUTH_HEADER } from 'src/config/constants';

export type VerificationEmailRequest = {
  id: string;
  authToken: string;
};

export type VerificationEmailResponse = {
  success: boolean;
};

const verificationEmailRequest = async (payload: VerificationEmailRequest) => {
  const response = await request<VerificationEmailResponse>({
    method: 'post',
    url: '/hosted/user/email/challenge',
    data: {
      id: payload.id,
    },
    headers: {
      [MY1FP_AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useVerificationEmail = () =>
  useMutation<
    VerificationEmailResponse,
    RequestError,
    VerificationEmailRequest
  >(verificationEmailRequest);

export default useVerificationEmail;
