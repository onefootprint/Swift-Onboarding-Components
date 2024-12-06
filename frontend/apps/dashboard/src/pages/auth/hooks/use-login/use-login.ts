import type { RequestError } from '@onefootprint/request';
import request, { useRequestError } from '@onefootprint/request';
import type { OrgAuthLoginRequest, OrgAuthLoginResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

const login = async (data: OrgAuthLoginRequest) => {
  const response = await request<OrgAuthLoginResponse>({
    method: 'POST',
    url: '/org/auth/login',
    data,
  });

  return response.data;
};

const useLogin = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.auth' });
  const router = useRouter();
  const toast = useToast();
  const { getErrorCode } = useRequestError();

  return useMutation({
    mutationFn: login,
    onError(e: RequestError): void {
      if (getErrorCode(e) === 'E129') {
        // Will be handled in the parent component
        return;
      }

      let description;
      if (e.response?.status === 401) {
        description = e.response.data.message;
      } else {
        description = t('workos-error.description');
      }
      toast.show({
        title: t('workos-error.title'),
        description,
        variant: 'error',
      });
      router.replace('/authentication/sign-in');
    },
  });
};

export default useLogin;
