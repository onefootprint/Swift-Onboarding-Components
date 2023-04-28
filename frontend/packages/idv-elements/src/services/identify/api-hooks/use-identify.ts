import request from '@onefootprint/request';
import { IdentifyRequest, IdentifyResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { ONBOARDING_CONFIG_KEY_HEADER } from '../../../config/constants';

const identifyRequest = async (payload: IdentifyRequest) => {
  const response = await request<IdentifyResponse>({
    method: 'POST',
    url: '/hosted/identify',
    data: payload,
    headers: payload.tenantPk
      ? { [ONBOARDING_CONFIG_KEY_HEADER]: payload.tenantPk }
      : {},
  });
  const { userFound, availableChallengeKinds, hasSyncablePassKey } =
    response.data;

  return {
    userFound,
    availableChallengeKinds,
    hasSyncablePassKey,
  };
};
const useIdentify = () => useMutation(identifyRequest);

export default useIdentify;
