import { useTranslation } from '@onefootprint/hooks';
import { useBifrostMachine } from 'src/components/bifrost-machine-provider';
import { Events } from 'src/hooks/use-bifrost-machine';
import useOnboardingComplete from 'src/pages/confirm-and-authorize/hooks/use-onboarding-complete';
import { useToast } from 'ui';

import useSyncData from '../../../hooks/use-sync-data';

const useConfirmOnboardingData = () => {
  const { t } = useTranslation('pages.confirm-and-authorize');
  const [state, send] = useBifrostMachine();
  const { syncData } = useSyncData();
  const toast = useToast();
  const completeOnboardingMutation = useOnboardingComplete();

  const showSyncDataError = () => {
    toast.show({
      title: t('sync-data-error.title'),
      description: t('sync-data-error.description'),
      variant: 'error',
    });
  };

  const showOnboardingError = () => {
    toast.show({
      title: t('onboarding-complete-error.title'),
      description: t('onboarding-complete-error.description'),
      variant: 'error',
    });
  };

  const completeOnboarding = (
    authToken: string,
    tenantPk: string,
    onComplete?: () => void,
  ) => {
    completeOnboardingMutation.mutate(
      { authToken, tenantPk },
      {
        onSuccess: ({ validationToken }) => {
          onComplete?.();
          send({
            type: Events.sharedDataConfirmed,
            payload: {
              validationToken,
            },
          });
        },
        onError() {
          showOnboardingError();
          onComplete?.();
        },
      },
    );
  };

  return (options: { onComplete?: () => void } = {}) => {
    const {
      authToken,
      tenant,
      onboarding: { data, missingAttributes },
    } = state.context;
    if (!authToken) {
      showSyncDataError();
      options.onComplete?.();
      return;
    }

    // If the user didn't fill any new fields, no need to call the
    // hosted/user/data endpoint non-speculatively.
    // For now, we still call hosted/onboarding/complete, in case this is
    // a new onboarding or a new tenant.
    if (!missingAttributes.length) {
      completeOnboarding(authToken, tenant.pk, options.onComplete);
      return;
    }

    syncData(authToken, data, {
      speculative: false,
      onSuccess: () => {
        completeOnboarding(authToken, tenant.pk, options.onComplete);
      },
      onError: () => {
        showSyncDataError();
        options.onComplete?.();
      },
    });
  };
};

export default useConfirmOnboardingData;
