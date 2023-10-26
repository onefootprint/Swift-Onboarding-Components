import { useTranslation } from '@onefootprint/hooks';
import {
  BusinessDI,
  CollectedKybDataOption,
  CollectedKybDataOptionToRequiredAttributes,
} from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../../../components/layout/components/header-title';
import Logger from '../../../../utils/logger';
import CollectKybDataNavigationHeader from '../../components/collect-kyb-data-navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { BasicData as BasicDataFields } from '../../utils/state-machine/types';
import BasicDataForm from './components/basic-data-form';

type BasicDataProps = {
  hideHeader?: boolean;
  ctaLabel?: string;
  onComplete?: () => void;
  onCancel?: () => void;
};

const BasicData = ({
  ctaLabel,
  hideHeader,
  onComplete,
  onCancel,
}: BasicDataProps) => {
  const [state, send] = useCollectKybDataMachine();
  const { authToken, config, data, kybRequirement } = state.context;
  const { missingAttributes } = kybRequirement || {};
  const { mutation, syncData } = useSyncData();
  const { t, allT } = useTranslation('pages.basic-data');

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

    const handleError = (error: string) => {
      console.error(
        `Speculatively vaulting data failed in kyb basic-data page: ${error}`,
      );
      Logger.error(
        `Speculatively vaulting data failed in kyb basic-data page: ${error}`,
        'kyb-basic-data',
      );
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

  const corpTypeValue = data?.[BusinessDI.corporationType];
  const defaultValues = {
    name: data?.[BusinessDI.name],
    doingBusinessAs: data?.[BusinessDI.doingBusinessAs],
    tin: data?.[BusinessDI.tin],
    corporationType: corpTypeValue
      ? {
          value: corpTypeValue,
          label: allT(
            `pages.basic-data.form.corporation-type.mapping.${corpTypeValue}`,
          ),
        }
      : undefined,
    phoneNumber: data?.[BusinessDI.phoneNumber],
    website: data?.[BusinessDI.website],
  };

  const optionalFields = missingAttributes
    .filter(
      attr =>
        attr === CollectedKybDataOption.corporationType ||
        attr === CollectedKybDataOption.phoneNumber ||
        attr === CollectedKybDataOption.website,
    )
    .map(attr => CollectedKybDataOptionToRequiredAttributes[attr])
    .flat() as (
    | BusinessDI.corporationType
    | BusinessDI.phoneNumber
    | BusinessDI.website
  )[];

  return (
    <Stack direction="column" gap={7} width="100%">
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
        optionalFields={optionalFields}
        onSubmit={handleSubmit}
        isLoading={mutation.isLoading}
        onCancel={onCancel}
        ctaLabel={ctaLabel}
        config={config}
      />
    </Stack>
  );
};

export default BasicData;
