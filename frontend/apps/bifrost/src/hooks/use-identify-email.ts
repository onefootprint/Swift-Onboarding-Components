import { useMutation } from 'react-query';
import request from 'request';

export interface IdentifyEmailRequest {
  email: string;
}

export enum IdentifyEmailResponseKind {
  UserNotFound = 'user_not_found',
}

export interface IdentifyEmailResponse {
  data: {
    data:
      | IdentifyEmailResponseKind
      | {
          phone_number_last_two: string;
        };
  };
}

const identifyEmailRequest = (payload: IdentifyEmailRequest) =>
  request({ method: 'POST', url: '/identify/email', data: payload });

const useIdentifyEmail = () =>
  useMutation<IdentifyEmailResponse, any, IdentifyEmailRequest>(
    identifyEmailRequest,
  );

export default useIdentifyEmail;
