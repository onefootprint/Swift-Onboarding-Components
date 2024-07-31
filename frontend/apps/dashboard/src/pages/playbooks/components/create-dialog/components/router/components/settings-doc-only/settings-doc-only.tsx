import { Button, Text } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { type DataToCollectFormData, type DataToCollectMeta } from '@/playbooks/utils/machine/types';

import AdditionalDocs from '../additional-docs';
import GovDocs from '../gov-docs';

type SettingsDocOnlyProps = {
  defaultValues: DataToCollectFormData;
  isLastStep?: boolean;
  isLoading?: boolean;
  onBack: () => void;
  onSubmit: (data: DataToCollectFormData) => void;
};

const SettingsDocOnly = ({ onSubmit, onBack, defaultValues, isLastStep, isLoading }: SettingsDocOnlyProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.settings-doc-only',
  });
  const formMethods = useForm<DataToCollectFormData>({ defaultValues });
  const { handleSubmit, watch } = formMethods;
  const selectedGlobalDocs = watch('personal.docs.global');
  const selectedCountrySpecificDocs = watch('personal.docs.country');
  const poa = watch('personal.additionalDocs.poa') || false;
  const possn = watch('personal.additionalDocs.possn') || false;
  const custom = watch('personal.additionalDocs.custom') || [];

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
      <Header>
        <Text variant="label-1" color="secondary">
          {t('title')}
        </Text>
        <Text variant="body-2" color="secondary">
          {t('subtitle')}
        </Text>
      </Header>
      <FormProvider {...formMethods}>
        <Form id="settings-doc-only-form" onSubmit={handleSubmit(onSubmit)}>
          <GovDocs />
          <AdditionalDocs />
          <ButtonContainer>
            <Button variant="secondary" onClick={onBack}>
              {allT('back')}
            </Button>
            <Button disabled={isNextDisabled()} type="submit" loading={isLoading && isLastStep}>
              {isLastStep ? allT('create') : allT('next')}
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

const Header = styled.header`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
    padding-top: ${theme.spacing[5]};
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

export default SettingsDocOnly;
