import { Logger } from '@onefootprint/dev-tools';
import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  CollectedKycDataOption,
  IdDI,
  isCountryCode,
} from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import EditableFormButtonContainer from '../../../../components/editable-form-button-container';
import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../components/navigation-header';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import allAttributes from '../../utils/all-attributes/all-attributes';
import getInitialCountry from '../../utils/get-initial-country';
import DobField from './components/dob-field';
import NameFields from './components/name-fields';
import NationalityField from './components/nationality-field';
import useConvertFormData from './hooks/use-convert-form-data';
import type { FormData } from './types';

type BasicInformationProps = {
  hideHeader?: boolean;
  ctaLabel?: string;
  onComplete?: () => void;
  onCancel?: () => void;
};

const BasicInformation = ({
  ctaLabel,
  hideHeader,
  onComplete,
  onCancel,
}: BasicInformationProps) => {
  const [state, send] = useCollectKycDataMachine();
  const { data, requirement } = state.context;
  const { mutation, syncData } = useSyncData();
  const { t } = useTranslation('pages.basic-information');
  const attributes = allAttributes(requirement);
  const requiresName = attributes.includes(CollectedKycDataOption.name);
  const requiresDob = attributes.includes(CollectedKycDataOption.dob);
  const requiresNationality = attributes.includes(
    CollectedKycDataOption.nationality,
  );
  const convertFormData = useConvertFormData();
  const isNameDisabled =
    data?.[IdDI.firstName]?.disabled || data?.[IdDI.lastName]?.disabled;
  const isNationalityDisabled = data?.[IdDI.nationality]?.disabled;
  const isDobDisabled = data?.[IdDI.dob]?.disabled;
  const nationalityValue = data?.[IdDI.nationality]?.value;
  const defaultNationality =
    nationalityValue && isCountryCode(nationalityValue)
      ? nationalityValue
      : undefined;

  const methods = useForm<FormData>({
    defaultValues: {
      firstName: data[IdDI.firstName]?.value,
      middleName: data[IdDI.middleName]?.value,
      lastName: data[IdDI.lastName]?.value,
      dob: data[IdDI.dob]?.value,
      nationality: getInitialCountry(defaultNationality),
    },
  });

  const onSubmitFormData = (formData: FormData) => {
    const convertedData = convertFormData(formData);
    syncData({
      data: convertedData,
      speculative: true,
      onSuccess: () => {
        send({
          type: 'dataSubmitted',
          payload: convertedData,
        });
        onComplete?.();
      },
      onError: (error: string) => {
        console.error(
          `Speculatively vaulting data failed in kyc basic-information page. ${error}`,
        );
        Logger.error(
          `Speculatively vaulting data failed in kyc basic-information page. ${error}`,
          'kyc-basic-information',
        );
      },
    });
  };

  return (
    <>
      {hideHeader ? null : (
        <>
          <NavigationHeader />
          <HeaderTitle
            title={t('title')}
            subtitle={t('subtitle')}
            sx={{ marginBottom: 7 }}
          />
        </>
      )}
      <FormProvider {...methods}>
        <Form onSubmit={methods.handleSubmit(onSubmitFormData)}>
          <Stack direction="column" gap={5}>
            {requiresName && <NameFields disabled={isNameDisabled} />}
            {requiresDob && <DobField disabled={isDobDisabled} />}
            {requiresNationality && (
              <NationalityField disabled={isNationalityDisabled} />
            )}
          </Stack>
          <EditableFormButtonContainer
            isLoading={mutation.isLoading}
            onCancel={onCancel}
            ctaLabel={ctaLabel}
          />
        </Form>
      </FormProvider>
    </>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;

export default BasicInformation;
