import { useMutation } from 'react-query';
import request from 'request';

export interface VerifyPhoneRequest {
  code: string; // 6 digit challenge that was sent to user's phone number
}

export enum VerifyPhoneResponseKind {
  UserCreated = 'user_created', // Created a new user vault
  UserFound = 'user_inherited', // Found an existing user vault
}

export interface VerifyPhoneResponse {
  data: {
    data: VerifyPhoneResponseKind;
  };
}

const verifyPhoneRequest = (payload: VerifyPhoneRequest) =>
  request({ method: 'POST', url: '/identify/verify', data: payload });

const useVerifyPhone = () =>
  useMutation<VerifyPhoneResponse, any, VerifyPhoneRequest>(verifyPhoneRequest);

export default useVerifyPhone;
