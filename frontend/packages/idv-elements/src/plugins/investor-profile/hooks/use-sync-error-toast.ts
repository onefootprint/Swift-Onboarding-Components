import { useTranslation } from '@onefootprint/hooks';
import { useToast } from '@onefootprint/ui';

const useSyncErrorToast = () => {
  const { t } = useTranslation('components.sync-data-error');
  const toast = useToast();

  return () => {
    toast.show({
      title: t('title'),
      description: t('description'),
      variant: 'error',
    });
  };
};

export default useSyncErrorToast;
