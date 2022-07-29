import { useMutation } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';

export type IdentifyPhoneRequest = {
  phoneNumber: string;
};

export type IdentifyPhoneResponse = {
  challengeToken: string;
  phoneNumberLastTwo: string;
};

const identifyPhoneRequest = async (payload: IdentifyPhoneRequest) => {
  const { data: response } = await request<
    RequestResponse<IdentifyPhoneResponse>
  >({
    method: 'POST',
    url: '/identify/phone',
    data: payload,
  });
  return response.data;
};

const useIdentifyPhone = () =>
  useMutation<IdentifyPhoneResponse, RequestError, IdentifyPhoneRequest>(
    identifyPhoneRequest,
  );

export default useIdentifyPhone;
