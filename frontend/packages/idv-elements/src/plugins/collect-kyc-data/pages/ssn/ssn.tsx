import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { CollectedKycDataOption, IdDI } from '@onefootprint/types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import EditableFormButtonContainer from '../../../../components/editable-form-button-container';
import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../components/navigation-header';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import allAttributes from '../../utils/all-attributes';
import SSN4 from './components/ssn4';
import SSN9 from './components/ssn9';
import useConvertFormData from './hooks/use-convert-form-data';
import { FormData } from './types';

type SSNProps = {
  onComplete?: () => void;
  onCancel?: () => void;
  ctaLabel?: string;
  hideDisclaimer?: boolean;
  hideHeader?: boolean;
};

const SSN = ({
  hideDisclaimer,
  ctaLabel,
  hideHeader,
  onComplete,
  onCancel,
}: SSNProps) => {
  const [state, send] = useCollectKycDataMachine();
  const { data, requirement } = state.context;
  const { mutation, syncData } = useSyncData();
  const convertFormData = useConvertFormData();

  const { t } = useTranslation('pages.ssn');
  const requiresSsn9 = allAttributes(requirement).includes(
    CollectedKycDataOption.ssn9,
  );
  const title = requiresSsn9 ? t('full.title') : t('last-four.title');
  const subtitle = requiresSsn9 ? t('full.subtitle') : t('last-four.subtitle');

  const methods = useForm<FormData>({
    defaultValues: {
      ssn9: data[IdDI.ssn9]?.value,
      ssn4: data[IdDI.ssn4]?.value,
    },
  });
  const isSsn4Disabled = data?.[IdDI.ssn4]?.disabled;
  const isSsn9Disabled = data?.[IdDI.ssn9]?.disabled;

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
            <SSN9 hideDisclaimer={hideDisclaimer} disabled={isSsn9Disabled} />
          ) : (
            <SSN4 disabled={isSsn4Disabled} />
          )}
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
    width: 100%;
  `}
`;

export default SSN;
