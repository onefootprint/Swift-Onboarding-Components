import { useTranslation } from '@onefootprint/hooks';
import { CollectedKycDataOption } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React from 'react';

import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import { KycData } from '../../utils/data-types';
import AddressFull from './components/address-full';
import AddressZipCodeAndCountry from './components/address-zip-code-and-country';

type ResidentialAddressProps = {
  ctaLabel?: string;
  onComplete?: () => void;
  hideHeader?: boolean;
};

const ResidentialAddress = ({
  ctaLabel,
  onComplete,
  hideHeader,
}: ResidentialAddressProps) => {
  const { t } = useTranslation('pages.residential-address');
  const [state, send] = useCollectKycDataMachine();
  const {
    requirement: { missingAttributes },
    authToken,
  } = state.context;
  const toast = useToast();
  const { mutation, syncData } = useSyncData();

  const handleSubmit = (residentialAddress: KycData) => {
    const handleSuccess = () => {
      send({
        type: 'dataSubmitted',
        payload: residentialAddress,
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
    syncData({
      authToken,
      data: residentialAddress,
      speculative: true,
      onSuccess: handleSuccess,
      onError: handleError,
    });
  };

  if (missingAttributes.includes(CollectedKycDataOption.fullAddress)) {
    return (
      <AddressFull
        onSubmit={handleSubmit}
        isMutationLoading={mutation.isLoading}
        ctaLabel={ctaLabel}
        hideHeader={hideHeader}
      />
    );
  }
  if (missingAttributes.includes(CollectedKycDataOption.partialAddress)) {
    return (
      <AddressZipCodeAndCountry
        onSubmit={handleSubmit}
        isMutationLoading={mutation.isLoading}
        ctaLabel={ctaLabel}
        hideHeader={hideHeader}
      />
    );
  }
  return <div />;
};

export default ResidentialAddress;
