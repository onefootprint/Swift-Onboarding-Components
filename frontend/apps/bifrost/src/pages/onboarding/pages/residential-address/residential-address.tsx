import { useTranslation } from 'hooks';
import React from 'react';
import { Events } from 'src/utils/state-machine/onboarding';
import {
  ResidentialAddress as ResidentialAddressData,
  UserDataAttribute,
} from 'src/utils/state-machine/types';
import useToast from 'ui/src/components/toast/hooks/use-toast';

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

  const requiresFullAddress =
    missingAttributes.indexOf(UserDataAttribute.streetAddress) > -1 ||
    missingAttributes.indexOf(UserDataAttribute.streetAddress2) > -1 ||
    missingAttributes.indexOf(UserDataAttribute.city) > -1 ||
    missingAttributes.indexOf(UserDataAttribute.state) > -1;

  if (requiresFullAddress) {
    return (
      <AddressFull
        onSubmit={handleSubmit}
        isMutationLoading={mutation.isLoading}
      />
    );
  }

  return (
    <AddressZipCodeAndCountry
      onSubmit={handleSubmit}
      isMutationLoading={mutation.isLoading}
    />
  );
};

export default ResidentialAddress;
