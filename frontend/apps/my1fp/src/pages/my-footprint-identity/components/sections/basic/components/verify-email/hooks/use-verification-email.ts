import { useMutation } from 'react-query';
import { RequestError } from 'request';

export type VerificationEmailRequest = {
  authToken: string;
};

export type VerifyResponse = string;

// TODO: Make real integration
// https://linear.app/footprint/issue/FP-499/verify-email
const verificationEmail = async (
  payload: VerificationEmailRequest,
): Promise<VerifyResponse> =>
  new Promise(resolve => {
    console.log('making fake verify email request', payload);
    setTimeout(() => {
      resolve('success');
    }, 250);
  });

const useVerificationEmail = () =>
  useMutation<VerifyResponse, RequestError, VerificationEmailRequest>(
    verificationEmail,
  );

export default useVerificationEmail;
