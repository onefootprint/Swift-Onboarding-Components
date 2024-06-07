import { Button, Text } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { isAuth, isIdDoc } from '@/playbooks/utils/kind';
import type { SummaryFormData, SummaryMeta } from '@/playbooks/utils/machine/types';
import { OnboardingTemplate, PlaybookKind } from '@/playbooks/utils/machine/types';

import DataCollection from './components/data-collection';

type SummaryProps = {
  defaultValues: SummaryFormData;
  meta: SummaryMeta;
  onBack: () => void;
  onSubmit: (data: SummaryFormData) => void;
  isLastStep?: boolean;
  isLoading?: boolean;
};

const Summary = ({ meta, onSubmit, onBack, defaultValues, isLastStep, isLoading }: SummaryProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.summary',
  });

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
    if (isIdDoc(meta.kind)) {
      return t('title.id-doc');
    }
    const internationalOnly = meta.residency?.allowInternationalResidents && !meta.residency.allowUsResidents;
    const canEdit = !internationalOnly && meta.onboardingTemplate === OnboardingTemplate.Custom;
    return canEdit ? t('title.default-editable') : t('title.default-non-editable');
  };

  const getSubtitle = (): string => {
    if (isAuth(meta.kind)) return t('subtitle.auth');
    if (isIdDoc(meta.kind)) return t('subtitle.id-doc');

    const internationalOnly = meta.residency?.allowInternationalResidents && !meta.residency.allowUsResidents;

    if (internationalOnly) return t('subtitle.international-only');
    return meta.onboardingTemplate ? onboardingTemplateToSubtitleMap[meta.onboardingTemplate] : t('subtitle.default');
  };

  const formMethods = useForm<SummaryFormData>({ defaultValues });
  const { handleSubmit, watch } = formMethods;
  const selectedGlobalDocs = watch('personal.idDocKind');
  const selectedCountrySpecificDocs = watch('personal.countrySpecificIdDocKind');

  const isNextDisabled = () => {
    if (
      meta.kind === PlaybookKind.IdDoc &&
      selectedGlobalDocs.length === 0 &&
      Object.keys(selectedCountrySpecificDocs).length === 0
    ) {
      return true;
    }
    return false;
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
              {isLastStep ? allT('pages.playbooks.create-button') : allT('next')}
            </Button>
          </ButtonContainer>
        </Form>
      </FormProvider>
    </Container>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
    padding-top: ${theme.spacing[5]};
  `};
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    width: 520px;
    white-space: pre-wrap;
  `};
`;

export default Summary;
