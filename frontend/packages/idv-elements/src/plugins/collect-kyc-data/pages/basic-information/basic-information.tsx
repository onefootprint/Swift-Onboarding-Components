import { useTranslation } from '@onefootprint/hooks';
import { CollectedKycDataOption, IdDI } from '@onefootprint/types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../components/layout/components/header-title';
import CtaButton from '../../components/cta-button';
import NavigationHeader from '../../components/navigation-header';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import allAttributes from '../../utils/all-attributes/all-attributes';
import DobField from './components/dob-field';
import NameFields from './components/name-fields';
import useConvertFormData from './hooks/use-convert-form-data';
import { FormData } from './types';

type BasicInformationProps = {
  hideHeader?: boolean;
  ctaLabel?: string;
  onComplete?: () => void;
};

const BasicInformation = ({
  ctaLabel,
  hideHeader,
  onComplete,
}: BasicInformationProps) => {
  const [state, send] = useCollectKycDataMachine();
  const { data, requirement } = state.context;
  const { mutation, syncData } = useSyncData();
  const { t } = useTranslation('pages.basic-information');
  const attributes = allAttributes(requirement);
  const requiresName = attributes.includes(CollectedKycDataOption.name);
  const requiresDob = attributes.includes(CollectedKycDataOption.dob);
  const convertFormData = useConvertFormData();
  const isFirstNameDisabled = data?.[IdDI.firstName]?.disabled;
  const isLastNameDisabled = data?.[IdDI.lastName]?.disabled;
  const isDobDisabled = data?.[IdDI.dob]?.disabled;

  const methods = useForm<FormData>({
    defaultValues: {
      firstName: data[IdDI.firstName]?.value,
      lastName: data[IdDI.lastName]?.value,
      dob: data[IdDI.dob]?.value,
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
          {requiresName && (
            <NameFields
              isFirstNameDisabled={isFirstNameDisabled}
              isLastNameDisabled={isLastNameDisabled}
            />
          )}
          {requiresDob && <DobField disabled={isDobDisabled} />}
          <CtaButton isLoading={mutation.isLoading} label={ctaLabel} />
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
