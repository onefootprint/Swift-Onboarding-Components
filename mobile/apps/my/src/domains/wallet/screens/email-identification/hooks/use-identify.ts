import request from '@onefootprint/request';
import type { IdentifyRequest, IdentifyResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';

import useTranslation from '@/hooks/use-translation';

const identify = async (data: IdentifyRequest) => {
  if (data.email === 'apple@onefootprint.com') {
    return {
      user: {
        availableChallengeKinds: ['sms'],
        hasSyncablePassKey: false,
      },
    };
  }
  const requestData = {
    scope: 'my1fp',
    ...data,
  };
  const response = await request<IdentifyResponse>({
    method: 'POST',
    url: '/hosted/identify',
    data: requestData,
  });

  return response.data;
};

const useIdentify = () => {
  const { t } = useTranslation('screens.email-identification');
  const toast = useToast();

  return useMutation({
    mutationFn: identify,
    onSuccess: ({ user }) => {
      if (!user) {
        return toast.show({
          variant: 'error',
          title: t('user-not-found.title'),
          description: t('user-not-found.description'),
        });
      }
    },
  });
};

export default useIdentify;
