import { useTranslation } from '@onefootprint/hooks';
import { CollectedDataOption } from '@onefootprint/types';
import React from 'react';
import { useToast } from 'ui';

import { useCollectKycDataMachine } from '../../components/machine-provider';
import useSyncData from '../../hooks/use-sync-data';
import {
  BasicInformation as BasicInformationData,
  Events,
} from '../../utils/state-machine/types';
import NameAndDobForm from './components/name-and-dob-form';
import NameForm from './components/name-form';

const BasicInformation = () => {
  const [state, send] = useCollectKycDataMachine();
  const { authToken, missingAttributes } = state.context;
  const { mutation, syncData } = useSyncData();
  const toast = useToast();
  const { t } = useTranslation('pages.basic-information');

  const onSubmit = (basicInformation: BasicInformationData) => {
    const handleSuccess = () => {
      send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation,
        },
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
    syncData(authToken, basicInformation, {
      speculative: true,
      onSuccess: handleSuccess,
      onError: handleError,
    });
  };

  // TODO right now it is possible to only request the DOB
  const requiresDob = missingAttributes.includes(CollectedDataOption.dob);
  if (requiresDob) {
    return (
      <NameAndDobForm
        onSubmit={onSubmit}
        isMutationLoading={mutation.isLoading}
      />
    );
  }

  return (
    <NameForm onSubmit={onSubmit} isMutationLoading={mutation.isLoading} />
  );
};

export default BasicInformation;
