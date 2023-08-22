import request from '@onefootprint/request';
import { ConsentRequest, ConsentResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../config/constants';

const consentRequest = async ({
  consentLanguageText,
  authToken,
}: ConsentRequest) => {
  const response = await request<ConsentResponse>({
    method: 'POST',
    url: '/hosted/user/consent',
    data: {
      consentLanguageText,
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const useConsent = () => useMutation(consentRequest);

export default useConsent;
