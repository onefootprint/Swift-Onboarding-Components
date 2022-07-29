import { useMutation } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';

export type EmailLoginRequest = {
  emailAddress: string;
  redirectUrl: string;
};

export type EmailLoginResponse = {};

const loginEmailRequest = async (payload: EmailLoginRequest) => {
  const { data: response } = await request<RequestResponse<EmailLoginResponse>>(
    {
      method: 'POST',
      url: '/org/auth/magic_link',
      data: payload,
    },
  );
  return response.data;
};

const useLoginEmail = () =>
  useMutation<EmailLoginResponse, RequestError, EmailLoginRequest>(
    loginEmailRequest,
  );

export default useLoginEmail;
