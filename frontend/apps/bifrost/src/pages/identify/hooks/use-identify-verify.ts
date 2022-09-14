import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import { IdentifyVerifyRequest, IdentifyVerifyResponse } from 'types';

const identifyVerifyRequest = async (payload: IdentifyVerifyRequest) => {
  const response = await request<IdentifyVerifyResponse>({
    method: 'POST',
    url: '/hosted/identify/verify',
    data: payload,
  });
  return response.data;
};

const useIdentifyVerify = () =>
  useMutation<IdentifyVerifyResponse, RequestError, IdentifyVerifyRequest>(
    identifyVerifyRequest,
  );

export default useIdentifyVerify;
