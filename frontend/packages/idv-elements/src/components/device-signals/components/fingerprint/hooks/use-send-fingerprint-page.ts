import request from '@onefootprint/request';
import {
  SendFingerprintPageRequest,
  SendFingerprintPageResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../../config/constants';

const sendFingerprintPageRequest = async (
  data: SendFingerprintPageRequest,
  authToken: string,
) => {
  const response = await request<SendFingerprintPageResponse>({
    method: 'POST',
    url: '/hosted/onboarding/fp',
    data,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useSendFingerprintPage = (authToken: string) =>
  useMutation({
    mutationFn: (data: SendFingerprintPageRequest) =>
      sendFingerprintPageRequest(data, authToken),
  });

export default useSendFingerprintPage;
