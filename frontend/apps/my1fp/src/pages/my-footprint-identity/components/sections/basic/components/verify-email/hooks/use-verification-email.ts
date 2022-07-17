import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';

export type VerificationEmailRequest = {
  emailAddress: string;
};

export type VerificationEmailResponse = {
  success: boolean;
};

const verificationEmailRequest = async (payload: VerificationEmailRequest) => {
  const { data: response } = await request<
    RequestResponse<VerificationEmailResponse>
  >({
    method: 'post',
    url: '/user/email',
    data: payload,
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
