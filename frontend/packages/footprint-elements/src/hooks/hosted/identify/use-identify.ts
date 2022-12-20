import request from '@onefootprint/request';
import { IdentifyRequest, IdentifyResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const identifyRequest = async (payload: IdentifyRequest) => {
  const response = await request<IdentifyResponse>({
    method: 'POST',
    url: '/hosted/identify',
    data: payload,
  });
  const { userFound, availableChallengeKinds } = response.data;

  return {
    userFound,
    availableChallengeKinds,
  };
};
const useIdentify = () => useMutation(identifyRequest);

export default useIdentify;
