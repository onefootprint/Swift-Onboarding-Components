import { useTranslation } from '@onefootprint/hooks';
import { CollectedDataOption } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React from 'react';

import { useCollectKycDataMachine } from '../../components/machine-provider';
import useSyncData from '../../hooks/use-sync-data';
import { ResidentialAddress as ResidentialAddressData } from '../../utils/data-types';
import { Events } from '../../utils/state-machine/types';
import AddressFull from './components/address-full';
import AddressZipCodeAndCountry from './components/address-zip-code-and-country';

type ResidentialAddressProps = {
  ctaLabel?: string;
  onComplete?: () => void;
  hideTitle?: boolean;
  hideNavHeader?: boolean;
};

const ResidentialAddress = ({
  ctaLabel,
  onComplete,
  hideTitle,
  hideNavHeader,
}: ResidentialAddressProps) => {
  const { t } = useTranslation('pages.residential-address');
  const [state, send] = useCollectKycDataMachine();
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
      onComplete?.();
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
        ctaLabel={ctaLabel}
        hideTitle={hideTitle}
        hideNavHeader={hideNavHeader}
      />
    );
  }
  if (missingAttributes.includes(CollectedDataOption.partialAddress)) {
    return (
      <AddressZipCodeAndCountry
        onSubmit={handleSubmit}
        isMutationLoading={mutation.isLoading}
        ctaLabel={ctaLabel}
        hideTitle={hideTitle}
        hideNavHeader={hideNavHeader}
      />
    );
  }
  return <div />;
};

export default ResidentialAddress;
