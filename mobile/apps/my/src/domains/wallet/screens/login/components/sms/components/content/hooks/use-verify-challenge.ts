import request, { getErrorMessage } from '@onefootprint/request';
import type { IdentifyVerifyRequest, IdentifyVerifyResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';

import useTranslation from '@/hooks/use-translation';

const identifyVerify = async (payload: IdentifyVerifyRequest & { isApple: boolean }) => {
  const { isApple, ...remainingPayload } = payload;
  if (isApple) {
    return {
      authToken: 'tok_apple',
    };
  }
  const data = {
    ...remainingPayload,
    scope: 'my1fp',
  };

  const response = await request<IdentifyVerifyResponse>({
    method: 'POST',
    url: '/hosted/identify/verify',
    data,
  });
  return response.data;
};

const useVerifyChallenge = () => {
  const { t } = useTranslation('screens.login.sms.error');
  const toast = useToast();

  return useMutation(identifyVerify, {
    onError: error => {
      toast.show({
        variant: 'error',
        title: t('title'),
        description: getErrorMessage(error),
      });
    },
  });
};

export default useVerifyChallenge;
