import {
  BusinessDI,
  type BusinessDIData,
  CollectedKybDataOption,
  CollectedKybDataOptionToRequiredAttributes,
} from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import type { TFunction } from 'i18next';
import HeaderTitle from '../../../../components/layout/components/header-title';
import { getLogger } from '../../../../utils/logger';
import CollectKybDataNavigationHeader from '../../components/collect-kyb-data-navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { BasicData as BasicDataFields } from '../../utils/state-machine/types';
import { getTinDefaultValue } from '../../utils/utils';
import BasicDataForm from './components/basic-data-form';

type BasicDataProps = {
  ctaLabel?: string;
  hideHeader?: boolean;
  hideInputTin?: boolean;
  onCancel?: () => void;
  onComplete?: () => void;
};

const { logError } = getLogger({ location: 'kyb-basic-data' });

const getDefaultValues = (t: TFunction<'idv', undefined>, data: BusinessDIData) => {
  const corporationTypeValue = data?.[BusinessDI.corporationType];
  const tinValue = data?.[BusinessDI.tin];

  return {
    name: data?.[BusinessDI.name],
    doingBusinessAs: data?.[BusinessDI.doingBusinessAs],
    tin: getTinDefaultValue(tinValue),
    corporationType: corporationTypeValue
      ? {
          value: corporationTypeValue,
          label: t(
            `kyb.pages.basic-data.form.corporation-type.mapping.${corporationTypeValue}` as unknown as TemplateStringsArray,
          ) as string,
        }
      : undefined,
    phoneNumber: data?.[BusinessDI.phoneNumber],
    website: data?.[BusinessDI.website],
  };
};

const BasicData = ({ ctaLabel, hideHeader, hideInputTin, onCancel, onComplete }: BasicDataProps) => {
  const [state, send] = useCollectKybDataMachine();
  const {
    idvContext: { authToken },
    config,
    data,
    kybRequirement,
  } = state.context;
  const { missingAttributes, populatedAttributes } = kybRequirement || {};
  const { mutation, syncData } = useSyncData();
  const { t } = useTranslation('idv');
  const defaultValues = getDefaultValues(t, data);

  const handleSubmit = (basicData: BasicDataFields) => {
    syncData({
      authToken,
      data: basicData,
      onSuccess: () => {
        send({ type: 'basicDataSubmitted', payload: basicData });
        onComplete?.();
      },
      onError: (error: string) => {
        logError(`Error vaulting kyb basic-data: ${error}`, error);
      },
    });
  };

  const optionalFields = missingAttributes
    .concat(populatedAttributes || [])
    .filter(
      attr =>
        attr === CollectedKybDataOption.corporationType ||
        attr === CollectedKybDataOption.phoneNumber ||
        attr === CollectedKybDataOption.website,
    )
    .flatMap(attr => CollectedKybDataOptionToRequiredAttributes[attr]) as (
    | BusinessDI.corporationType
    | BusinessDI.phoneNumber
    | BusinessDI.website
  )[];

  return (
    <Stack direction="column" gap={7} width="100%">
      {!hideHeader && (
        <>
          <CollectKybDataNavigationHeader />
          <HeaderTitle title={t('kyb.pages.basic-data.title')} subtitle={t('kyb.pages.basic-data.subtitle')} />
        </>
      )}
      <BasicDataForm
        config={config}
        ctaLabel={ctaLabel}
        defaultValues={defaultValues}
        hideInputTin={hideInputTin}
        isLoading={mutation.isPending}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        optionalFields={optionalFields}
      />
    </Stack>
  );
};

export default BasicData;
