import request from '@onefootprint/request';
import type { ConsentRequest, ConsentResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const consentRequest = async ({
  consentLanguageText,
  mlConsent,
  authToken,
}: ConsentRequest) => {
  const response = await request<ConsentResponse>({
    method: 'POST',
    url: '/hosted/user/consent',
    data: {
      consentLanguageText,
      mlConsent,
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const useConsent = () => useMutation(consentRequest);

export default useConsent;
