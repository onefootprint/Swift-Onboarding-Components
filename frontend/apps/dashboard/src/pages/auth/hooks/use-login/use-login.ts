import { useTranslation } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import { OrgAuthLoginResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';

const login = async (code: string) => {
  const response = await request<OrgAuthLoginResponse>({
    method: 'POST',
    url: '/org/auth/login',
    data: { code },
  });

  return response.data;
};

const useLogin = () => {
  const { t } = useTranslation('pages.auth');
  const router = useRouter();
  const toast = useToast();

  return useMutation(login, {
    onError: (e: any) => {
      let description;
      if (e.response.status === 401) {
        description = e.response.data.error.message;
      } else {
        description = t('workos-error.description');
      }
      toast.show({
        title: t('workos-error.title'),
        description,
        variant: 'error',
      });
      router.replace('/login');
    },
  });
};

export default useLogin;
