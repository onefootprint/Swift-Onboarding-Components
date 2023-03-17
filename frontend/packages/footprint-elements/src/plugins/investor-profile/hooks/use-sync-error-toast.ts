import { useTranslation } from '@onefootprint/hooks';
import { useToast } from '@onefootprint/ui';

const useSyncErrorToast = () => {
  const { allT } = useTranslation();
  const toast = useToast();

  return () => {
    toast.show({
      title: allT('pages.sync-data-error.title'),
      description: allT('pages.sync-data-error.description'),
      variant: 'error',
    });
  };
};

export default useSyncErrorToast;
