import request from '@onefootprint/request';
import { IdentifyRequest, IdentifyResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import { Linking } from 'react-native';

import useTranslation from '@/hooks/use-translation';

const identify = async (data: IdentifyRequest) => {
  if (data.identifier.email === 'apple@onefootprint.com') {
    return {
      userFound: true,
      availableChallengeKinds: ['sms'],
      hasSyncablePassKey: false,
    };
  }
  const response = await request<IdentifyResponse>({
    method: 'POST',
    url: '/hosted/identify',
    data,
  });

  return response.data;
};

const useIdentify = () => {
  const { t } = useTranslation('screens.email-identification');
  const toast = useToast();

  return useMutation({
    mutationFn: identify,
    onSuccess: ({ userFound }) => {
      if (!userFound) {
        return toast.show({
          variant: 'error',
          title: t('user-not-found.title'),
          description: t('user-not-found.description'),
          cta: {
            label: t('user-not-found.cta'),
            onPress: () => {
              Linking.openURL('https://live.onefootprint.com/');
            },
          },
        });
      }
    },
  });
};

export default useIdentify;
