import { useTranslation } from '@onefootprint/hooks';
import { CollectedDataOption } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React from 'react';

import { useCollectKycDataMachine } from '../../components/machine-provider';
import useSyncData from '../../hooks/use-sync-data';
import { Events, SSNInformation } from '../../utils/state-machine/types';
import SSN4 from './components/ssn4';
import SSN9 from './components/ssn9';

const SSN = () => {
  const [state, send] = useCollectKycDataMachine();
  const { authToken, missingAttributes } = state.context;
  const { mutation, syncData } = useSyncData();
  const toast = useToast();
  const { t } = useTranslation('pages.ssn');

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

    if (!authToken) {
      return;
    }
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
