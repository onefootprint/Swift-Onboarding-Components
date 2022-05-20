import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';

export type IdentifyEmailRequest = {
  email: string;
};

export type IdentifyEmailChallenge = {
  challengeToken: string;
  phoneNumberLastTwo: string;
};

export type IdentifyEmailResponse = {
  userFound: boolean;
  challengeData: IdentifyEmailChallenge | null;
};

const identifyEmailRequest = async (payload: IdentifyEmailRequest) => {
  const { data: response } = await request<
    RequestResponse<IdentifyEmailResponse>
  >({
    method: 'POST',
    url: '/identify/email',
    data: payload,
  });
  return response.data;
};

const useIdentifyEmail = () =>
  useMutation<IdentifyEmailResponse, RequestError, IdentifyEmailRequest>(
    identifyEmailRequest,
  );

export default useIdentifyEmail;
