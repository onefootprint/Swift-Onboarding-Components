import { useTranslation } from '@onefootprint/hooks';
import { BusinessDI } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../../../components/layout/components/header-title';
import CollectKybDataNavigationHeader from '../../components/collect-kyb-data-navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import { BasicData as BasicDataFields } from '../../utils/state-machine/types';
import BasicDataForm from './components/basic-data-form';

type BasicDataProps = {
  hideHeader?: boolean;
  ctaLabel?: string;
  onComplete?: () => void;
};

const BasicData = ({ ctaLabel, hideHeader, onComplete }: BasicDataProps) => {
  const [state, send] = useCollectKybDataMachine();
  const { authToken, data } = state.context;
  const { mutation, syncData } = useSyncData();
  const toast = useToast();
  const { allT, t } = useTranslation('pages.basic-data');

  const handleSubmit = (basicData: BasicDataFields) => {
    const handleSuccess = () => {
      send({
        type: 'basicDataSubmitted',
        payload: {
          ...basicData,
        },
      });
      onComplete?.();
    };

    const handleError = () => {
      toast.show({
        title: allT('pages.sync-data-error.title'),
        description: allT('pages.sync-data-error.description'),
        variant: 'error',
      });
    };

    if (!authToken) {
      return;
    }
    syncData({
      authToken,
      data: basicData,
      speculative: true,
      onSuccess: handleSuccess,
      onError: handleError,
    });
  };

  const defaultValues = {
    name: data?.[BusinessDI.name],
    doingBusinessAs: data?.[BusinessDI.doingBusinessAs],
    tin: data?.[BusinessDI.tin],
    phoneNumber: data?.[BusinessDI.phoneNumber],
    website: data?.[BusinessDI.website],
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
      <BasicDataForm
        defaultValues={defaultValues}
        optionalFields={[BusinessDI.website, BusinessDI.phoneNumber]}
        onSubmit={handleSubmit}
        isLoading={mutation.isLoading}
        ctaLabel={ctaLabel}
      />
    </>
  );
};

export default BasicData;
