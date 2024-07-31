import { Button, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import {
  type DataToCollectFormData,
  type DataToCollectMeta,
  OnboardingTemplate,
} from '@/playbooks/utils/machine/types';

import AdditionalDocs from '../additional-docs';
import GovDocs from '../gov-docs';
import Investor from '../investor';
import Person from '../person';

type SettingsKycProps = {
  defaultValues: DataToCollectFormData;
  meta: DataToCollectMeta;
  onBack: () => void;
  onSubmit: (data: DataToCollectFormData) => void;
};

const SettingsKyc = ({ meta, onSubmit, onBack, defaultValues }: SettingsKycProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.settings-person',
  });
  const formMethods = useForm<DataToCollectFormData>({ defaultValues });
  const { handleSubmit } = formMethods;
  const allowInternational = !!meta.residency?.allowInternationalResidents;
  const allowUs = !!meta.residency?.allowUsResidents;
  const isInternationalOnly = allowInternational && !allowUs;
  const isCustom = meta.onboardingTemplate === OnboardingTemplate.Custom;
  const canEdit = isInternationalOnly && isCustom;

  const getTitle = () => {
    return canEdit ? t('title.editable') : t('title.non-editable');
  };

  const getSubtitle = () => {
    const onboardingTemplateToSubtitleMap = {
      [OnboardingTemplate.Custom]: t('subtitle.editable'),
      [OnboardingTemplate.Alpaca]: t('subtitle.templates.alpaca'),
      [OnboardingTemplate.Apex]: t('subtitle.templates.apex'),
      [OnboardingTemplate.TenantScreening]: t('subtitle.templates.tenant-screening'),
      [OnboardingTemplate.CarRental]: t('subtitle.templates.car-rental'),
      [OnboardingTemplate.CreditCard]: t('subtitle.templates.credit-card'),
    };
    if (!canEdit) {
      return t('subtitle.non-editable');
    }
    if (meta.onboardingTemplate) {
      return onboardingTemplateToSubtitleMap[meta.onboardingTemplate];
    }
    return t('subtitle.editable');
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
          <Stack flexDirection="column" gap={5}>
            <Person meta={meta} />
            <GovDocs />
            <AdditionalDocs />
            {isCustom && <Investor />}
          </Stack>
          <ButtonContainer>
            <Button variant="secondary" onClick={onBack}>
              {allT('back')}
            </Button>
            <Button type="submit">{allT('next')}</Button>
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

export default SettingsKyc;
