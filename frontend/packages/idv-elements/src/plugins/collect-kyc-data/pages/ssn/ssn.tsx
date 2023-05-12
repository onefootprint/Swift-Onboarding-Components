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
import SSN4 from './components/ssn4/ssn4';
import SSN9 from './components/ssn9/ssn9';
import useConvertFormData from './hooks/use-convert-form-data/use-convert-form-data';
import { FormData } from './types';

type SSNProps = {
  onComplete?: () => void;
  ctaLabel?: string;
  hideDisclaimer?: boolean;
  hideHeader?: boolean;
};

const SSN = ({
  hideDisclaimer,
  ctaLabel,
  hideHeader,
  onComplete,
}: SSNProps) => {
  const [state, send] = useCollectKycDataMachine();
  const {
    data,
    requirement: { missingAttributes },
  } = state.context;
  const { mutation, syncData } = useSyncData();
  const convertFormData = useConvertFormData();

  const { t } = useTranslation('pages.ssn');
  const requiresSsn9 = missingAttributes.includes(CollectedKycDataOption.ssn9);
  const title = requiresSsn9 ? t('full.title') : t('last-four.title');
  const subtitle = requiresSsn9 ? t('full.subtitle') : t('last-four.subtitle');

  const methods = useForm<FormData>({
    defaultValues: {
      ssn9: data[IdDI.ssn9]?.value,
      ssn4: data[IdDI.ssn4]?.value,
    },
  });
  const isSsn4Fixed = data?.[IdDI.ssn9]?.fixed;
  const isSsn9Fixed = data?.[IdDI.ssn4]?.fixed;

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
      {!hideHeader && <NavigationHeader />}
      <FormProvider {...methods}>
        <Form onSubmit={methods.handleSubmit(onSubmitFormData)}>
          {!hideHeader && <HeaderTitle title={title} subtitle={subtitle} />}
          {requiresSsn9 ? (
            <SSN9 hideDisclaimer={hideDisclaimer} disabled={isSsn9Fixed} />
          ) : (
            <SSN4 disabled={isSsn4Fixed} />
          )}
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

export default SSN;
