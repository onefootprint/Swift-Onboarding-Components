import { useTranslation } from '@onefootprint/hooks';
import { useToast } from '@onefootprint/ui';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import CollectKybDataNavigationHeader from '../../components/collect-kyb-data-navigation-header/collect-kyb-data-navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import { BusinessAddressData } from '../../utils/state-machine/types';
import BusinessAddressForm from './components/business-address-form';

type BusinessAddressProps = {
  ctaLabel?: string;
  onComplete?: () => void;
  hideHeader?: boolean;
};

const BusinessAddress = ({
  ctaLabel,
  onComplete,
  hideHeader,
}: BusinessAddressProps) => {
  const { t } = useTranslation('pages.business-address');
  const [state, send] = useCollectKybDataMachine();
  const { authToken } = state.context;
  const toast = useToast();
  const { mutation, syncData } = useSyncData();

  const handleSubmit = (businessAddress: BusinessAddressData) => {
    const handleSuccess = () => {
      send({
        type: 'businessAddressSubmitted',
        payload: {
          businessAddress,
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
    syncData({
      authToken,
      data: businessAddress,
      speculative: true,
      onSuccess: handleSuccess,
      onError: handleError,
    });
  };

  return (
    <>
      {!hideHeader && (
        <>
          <CollectKybDataNavigationHeader />
          <HeaderTitle
            title={t('title')}
            subtitle={t('subtitle')}
            sx={{ marginBottom: 7 }}
          />
        </>
      )}
      <BusinessAddressForm
        onSubmit={handleSubmit}
        isLoading={mutation.isLoading}
        ctaLabel={ctaLabel}
      />
    </>
  );
};

export default BusinessAddress;
