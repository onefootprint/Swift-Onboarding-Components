import type { RequestError } from '@onefootprint/request';
import { useRequestError } from '@onefootprint/request';
import { useToast } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const useIdvRequestErrorToast = () => {
  const toast = useToast();
  const { getErrorMessage } = useRequestError();
  const { t } = useTranslation('idv');

  const notify = (error?: RequestError | unknown) => {
    toast.show({
      description: getErrorMessage(error),
      title: t('global.errors.error-toast.title'),
      variant: 'error',
    });
  };

  return notify;
};

export default useIdvRequestErrorToast;
