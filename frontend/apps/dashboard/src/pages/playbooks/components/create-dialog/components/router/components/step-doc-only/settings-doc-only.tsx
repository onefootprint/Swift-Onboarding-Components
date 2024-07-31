import { Button, Text } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';

import AdditionalDocs from '../additional-docs';
import GovDocs from '../gov-docs';
import Header from '../header';

type StepDocOnlyProps = {
  defaultValues: DataToCollectFormData;
  isLoading?: boolean;
  onBack: () => void;
  onSubmit: (data: DataToCollectFormData) => void;
};

const StepDocOnly = ({ onSubmit, onBack, defaultValues, isLoading }: StepDocOnlyProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.settings-doc-only',
  });
  const formMethods = useForm<DataToCollectFormData>({ defaultValues });
  const { handleSubmit, watch } = formMethods;
  const selectedGlobalDocs = watch('person.docs.gov.global');
  const selectedCountrySpecificDocs = watch('person.docs.gov.country');
  const poa = watch('person.docs.additional.poa') || false;
  const possn = watch('person.docs.additional.possn') || false;
  const custom = watch('person.docs.additional.custom') || [];

  const isNextDisabled = () => {
    const noGlobalDocsSelected = selectedGlobalDocs.length === 0;
    const noCountrySpecificDocsSelected = Object.keys(selectedCountrySpecificDocs).length === 0;
    const noGovDocs = noGlobalDocsSelected && noCountrySpecificDocsSelected;

    const noPoa = !poa;
    const noPossn = !possn;
    const noCustom = custom.length === 0;
    const noAdditionalDocs = noPoa && noPossn && noCustom;

    const noIdDocSelected = noGovDocs && noAdditionalDocs;

    return noIdDocSelected;
  };

  return (
    <Container>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <FormProvider {...formMethods}>
        <Form id="settings-doc-only-form" onSubmit={handleSubmit(onSubmit)}>
          <GovDocs />
          <AdditionalDocs />
          <ButtonContainer>
            <Button variant="secondary" onClick={onBack}>
              {allT('back')}
            </Button>
            <Button disabled={isNextDisabled()} type="submit" loading={isLoading}>
              {allT('create')}
            </Button>
          </ButtonContainer>
        </Form>
      </FormProvider>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    white-space: pre-wrap;
    width: 520px;
  `};
`;

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export default StepDocOnly;
