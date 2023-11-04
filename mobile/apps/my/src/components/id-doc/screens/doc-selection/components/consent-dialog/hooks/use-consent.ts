import request, { getErrorMessage } from '@onefootprint/request';
import type { ConsentRequest, ConsentResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '@/config/constants';
import useTranslation from '@/hooks/use-translation';

const consent = async ({ consentLanguageText, authToken }: ConsentRequest) => {
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

const useConsent = () => {
  const { t } = useTranslation('scan.selfie.consent');
  const toast = useToast();

  return useMutation({
    mutationFn: consent,
    onError: error => {
      toast.show({
        description: getErrorMessage(error),
        title: t('error.title'),
        variant: 'error',
      });
    },
  });
};

export default useConsent;
