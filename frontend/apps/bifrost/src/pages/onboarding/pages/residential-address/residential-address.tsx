import { useTranslation } from '@onefootprint/hooks';
import { CollectedDataOption } from '@onefootprint/types';
import React from 'react';
import { Events } from 'src/utils/state-machine/onboarding';
import { ResidentialAddress as ResidentialAddressData } from 'src/utils/state-machine/types';
import { useToast } from 'ui';

import useSyncData from '../../../../hooks/use-sync-data';
import useOnboardingMachine from '../../hooks/use-onboarding-machine';
import AddressFull from './components/address-full/address-full';
import AddressZipCodeAndCountry from './components/address-zip-code-and-country/address-zip-code-and-country';

const ResidentialAddress = () => {
  const { t } = useTranslation('pages.onboarding.residential-address');
  const [state, send] = useOnboardingMachine();
  const { missingAttributes } = state.context;
  const { authToken } = state.context;
  const toast = useToast();
  const { mutation, syncData } = useSyncData();

  const handleSubmit = (residentialAddress: ResidentialAddressData) => {
    const handleSuccess = () => {
      send({
        type: Events.residentialAddressSubmitted,
        payload: {
          residentialAddress,
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

    syncData(authToken, residentialAddress, {
      speculative: true,
      onSuccess: handleSuccess,
      onError: handleError,
    });
  };

  if (missingAttributes.includes(CollectedDataOption.fullAddress)) {
    return (
      <AddressFull
        onSubmit={handleSubmit}
        isMutationLoading={mutation.isLoading}
      />
    );
  }
  if (missingAttributes.includes(CollectedDataOption.partialAddress)) {
    return (
      <AddressZipCodeAndCountry
        onSubmit={handleSubmit}
        isMutationLoading={mutation.isLoading}
      />
    );
  }
  return <div />;
};

export default ResidentialAddress;
