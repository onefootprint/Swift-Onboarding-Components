import request, { RequestError } from '@onefootprint/request';
import {
  UserEmailChallengeRequest,
  UserEmailChallengeResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { MY1FP_AUTH_HEADER } from 'src/config/constants';

const verificationEmailRequest = async (payload: UserEmailChallengeRequest) => {
  const response = await request<UserEmailChallengeResponse>({
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
    UserEmailChallengeResponse,
    RequestError,
    UserEmailChallengeRequest
  >(verificationEmailRequest);

export default useVerificationEmail;
