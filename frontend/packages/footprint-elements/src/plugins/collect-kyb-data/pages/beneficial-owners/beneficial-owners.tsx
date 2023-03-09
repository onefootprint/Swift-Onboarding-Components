import { useTranslation } from '@onefootprint/hooks';
import { useToast } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../../../components/header-title';
import CollectKybDataNavigationHeader from '../../components/collect-kyb-data-navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import { BeneficialOwnersData } from '../../utils/state-machine/types';
import BeneficialOwnersForm from './components/beneficial-owners-form';

type BeneficialOwnersProps = {
  hideHeader?: boolean;
  ctaLabel?: string;
  onComplete?: () => void;
};

const BeneficialOwners = ({
  ctaLabel,
  hideHeader,
  onComplete,
}: BeneficialOwnersProps) => {
  const [state, send] = useCollectKybDataMachine();
  const { authToken } = state.context;
  const { mutation, syncData } = useSyncData();
  const toast = useToast();
  const { t } = useTranslation('pages.beneficial-owners');

  const handleSubmit = (beneficialOwners: BeneficialOwnersData) => {
    const handleSuccess = () => {
      send({
        type: 'beneficialOwnersSubmitted',
        payload: {
          beneficialOwners,
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
      data: beneficialOwners,
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
      <BeneficialOwnersForm
        onSubmit={handleSubmit}
        isLoading={mutation.isLoading}
        ctaLabel={ctaLabel}
      />
    </>
  );
};

export default BeneficialOwners;
