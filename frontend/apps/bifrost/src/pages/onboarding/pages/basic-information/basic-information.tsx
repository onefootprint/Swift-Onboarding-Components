import { useTranslation } from 'hooks';
import React from 'react';
import { Events } from 'src/utils/state-machine/onboarding';
import {
  BasicInformation as BasicInformationData,
  UserDataAttribute,
} from 'src/utils/state-machine/types';
import { useToast } from 'ui';

import useSyncData from '../../../../hooks/use-sync-data';
import useOnboardingMachine from '../../hooks/use-onboarding-machine';
import NameAndDobForm from './components/name-and-dob-form';
import NameForm from './components/name-form';

const BasicInformation = () => {
  const [state, send] = useOnboardingMachine();
  const { authToken, missingAttributes } = state.context;
  const { mutation, syncData } = useSyncData();
  const toast = useToast();
  const { t } = useTranslation('pages.onboarding.basic-information');

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

    syncData(authToken, basicInformation, {
      speculative: true,
      onSuccess: handleSuccess,
      onError: handleError,
    });
  };

  const requiresDob = missingAttributes.indexOf(UserDataAttribute.dob) > -1;
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
