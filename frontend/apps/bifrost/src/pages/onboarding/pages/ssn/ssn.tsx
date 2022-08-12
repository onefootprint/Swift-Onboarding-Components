import { useTranslation } from 'hooks';
import React from 'react';
import { Events } from 'src/utils/state-machine/onboarding';
import { UserData, UserDataAttribute } from 'src/utils/state-machine/types';
import useToast from 'ui/src/components/toast/hooks/use-toast';

import useSyncData from '../../../../hooks/use-sync-data';
import useOnboardingMachine from '../../hooks/use-onboarding-machine';
import SsnFull from './components/ssn-full';
import SsnLastFour from './components/ssn-last-four';

type FormData = Required<Pick<UserData, UserDataAttribute.ssn>>;

const SSN = () => {
  const [state, send] = useOnboardingMachine();
  const { authToken, missingAttributes } = state.context;
  const { mutation, syncData } = useSyncData();
  const toast = useToast();
  const { t } = useTranslation('pages.onboarding.ssn');

  const onSubmit = (formData: FormData) => {
    const ssn = { ssn: formData.ssn };
    const handleSuccess = () => {
      send({
        type: Events.ssnSubmitted,
        payload: ssn,
      });
    };

    const handleError = () => {
      toast.show({
        title: t('sync-data-error.title'),
        description: t('sync-data-error.description'),
        variant: 'error',
      });
    };

    syncData(authToken, ssn, {
      speculative: true,
      onSuccess: handleSuccess,
      onError: handleError,
    });
  };

  if (missingAttributes.indexOf(UserDataAttribute.lastFourSsn) > -1) {
    return (
      <SsnLastFour onSubmit={onSubmit} isMutationLoading={mutation.isLoading} />
    );
  }

  return <SsnFull onSubmit={onSubmit} isMutationLoading={mutation.isLoading} />;
};

export default SSN;
