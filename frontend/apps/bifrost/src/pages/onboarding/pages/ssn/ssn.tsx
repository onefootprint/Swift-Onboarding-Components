import { CollectedDataOption } from '@onefootprint/types';
import { useTranslation } from 'hooks';
import React from 'react';
import { Events } from 'src/utils/state-machine/onboarding';
import { SSNInformation } from 'src/utils/state-machine/types';
import { useToast } from 'ui';

import useSyncData from '../../../../hooks/use-sync-data';
import useOnboardingMachine from '../../hooks/use-onboarding-machine';
import SSN4 from './components/ssn4';
import SSN9 from './components/ssn9';

const SSN = () => {
  const [state, send] = useOnboardingMachine();
  const { authToken, missingAttributes } = state.context;
  const { mutation, syncData } = useSyncData();
  const toast = useToast();
  const { t } = useTranslation('pages.onboarding.ssn');

  const onSubmit = (ssnInfo: SSNInformation) => {
    const handleSuccess = () => {
      send({
        type: Events.ssnSubmitted,
        payload: ssnInfo,
      });
    };

    const handleError = () => {
      toast.show({
        title: t('sync-data-error.title'),
        description: t('sync-data-error.description'),
        variant: 'error',
      });
    };

    syncData(authToken, ssnInfo, {
      speculative: true,
      onSuccess: handleSuccess,
      onError: handleError,
    });
  };

  if (missingAttributes.includes(CollectedDataOption.ssn4)) {
    return <SSN4 onSubmit={onSubmit} isMutationLoading={mutation.isLoading} />;
  }

  if (missingAttributes.includes(CollectedDataOption.ssn9)) {
    return <SSN9 onSubmit={onSubmit} isMutationLoading={mutation.isLoading} />;
  }
  return <div />;
};

export default SSN;
