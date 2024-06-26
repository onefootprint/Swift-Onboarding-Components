import { Button, Text } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { isAuth, isIdDocOnly } from '@/playbooks/utils/kind';
import {
  type DataToCollectFormData,
  type DataToCollectMeta,
  OnboardingTemplate,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

import DataCollection from './components/data-collection';

type DataToCollectProps = {
  defaultValues: DataToCollectFormData;
  isLastStep?: boolean;
  isLoading?: boolean;
  meta: DataToCollectMeta;
  onBack: () => void;
  onSubmit: (data: DataToCollectFormData) => void;
};

const DataToCollect = ({ meta, onSubmit, onBack, defaultValues, isLastStep, isLoading }: DataToCollectProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.data-to-collect' });
  const formMethods = useForm<DataToCollectFormData>({ defaultValues });
  const { handleSubmit, watch } = formMethods;
  const selectedGlobalDocs = watch('personal.idDocKind');
  const selectedCountrySpecificDocs = watch('personal.countrySpecificIdDocKind');

  const onboardingTemplateToSubtitleMap = {
    [OnboardingTemplate.Custom]: t('subtitle.default'),
    [OnboardingTemplate.Alpaca]: t('subtitle.alpaca'),
    [OnboardingTemplate.Apex]: t('subtitle.apex'),
    [OnboardingTemplate.TenantScreening]: t('subtitle.tenant-screening'),
    [OnboardingTemplate.CarRental]: t('subtitle.car-rental'),
    [OnboardingTemplate.CreditCard]: t('subtitle.credit-card'),
  };

  const getTitle = (): string => {
    if (isAuth(meta.kind)) {
      return t('title.auth');
    }
    if (isIdDocOnly(meta.kind)) {
      return t('title.id-doc');
    }
    const internationalOnly = meta.residency?.allowInternationalResidents && !meta.residency.allowUsResidents;
    const canEdit = !internationalOnly && meta.onboardingTemplate === OnboardingTemplate.Custom;
    return canEdit ? t('title.default-editable') : t('title.default-non-editable');
  };

  const getSubtitle = (): string => {
    if (isAuth(meta.kind)) return t('subtitle.auth');
    if (isIdDocOnly(meta.kind)) return t('subtitle.id-doc');

    const internationalOnly = meta.residency?.allowInternationalResidents && !meta.residency.allowUsResidents;

    if (internationalOnly) return t('subtitle.international-only');
    return meta.onboardingTemplate ? onboardingTemplateToSubtitleMap[meta.onboardingTemplate] : t('subtitle.default');
  };

  const isNextDisabled = () => {
    const isIdDoc = meta.kind === PlaybookKind.IdDoc;
    const noGlobalDocsSelected = selectedGlobalDocs.length === 0;
    const noCountrySpecificDocsSelected = Object.keys(selectedCountrySpecificDocs).length === 0;
    const noIdDocSelected = noGlobalDocsSelected && noCountrySpecificDocsSelected;

    return isIdDoc && noIdDocSelected;
  };

  return (
    <Container>
      <Header>
        <Text variant="label-1" color="secondary">
          {getTitle()}
        </Text>
        <Text variant="body-2" color="secondary">
          {getSubtitle()}
        </Text>
      </Header>
      <FormProvider {...formMethods}>
        <Form id="your-playbook-form" onSubmit={handleSubmit(onSubmit)}>
          <DataCollection meta={meta} />
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

export default DataToCollect;
