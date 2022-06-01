// WARNING: DO NOT EDIT! THIS FILE WILL BE DELETED
import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';

export type VerifyPhoneRequest = {
  challengeToken: string; // Challenge token received after email-identification
  code: string; // 6 digit challenge that was sent to user's phone number
};

export enum VerifyPhoneResponseKind {
  userCreated = 'user_created', // Created a new user vault
  userInherited = 'user_inherited', // Found an existing user vault
}

export type VerifyPhoneResponse = {
  authToken: string;
  kind: VerifyPhoneResponseKind;
};

const verifyPhoneRequest = async (payload: VerifyPhoneRequest) => {
  const { data: response } = await request<
    RequestResponse<VerifyPhoneResponse>
  >({
    method: 'POST',
    url: '/identify/verify',
    data: payload,
  });
  return response.data;
};

const useVerifyPhone = () =>
  useMutation<VerifyPhoneResponse, RequestError, VerifyPhoneRequest>(
    verifyPhoneRequest,
  );

export default useVerifyPhone;
