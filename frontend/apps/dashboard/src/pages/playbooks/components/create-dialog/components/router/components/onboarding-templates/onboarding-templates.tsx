import { IcoAlpaca24, IcoLayer0124 } from '@onefootprint/icons';
import { Button, Divider, RadioSelect, Text } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { OnboardingTemplate } from '@/playbooks/utils/machine/types';

export type TemplateFormData = {
  template: OnboardingTemplate;
};

export type OnboardingTemplatesProps = {
  onSubmit: (formData: TemplateFormData) => void;
  onBack: () => void;
};

const OnboardingTemplates = ({
  onSubmit,
  onBack,
}: OnboardingTemplatesProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.onboarding-templates',
  });
  const { handleSubmit, control } = useForm<TemplateFormData>({
    defaultValues: { template: OnboardingTemplate.Custom },
  });

  const submit = (data: TemplateFormData) => {
    onSubmit({ template: data.template });
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
      <Form onSubmit={handleSubmit(submit)}>
        <Controller
          control={control}
          name="template"
          defaultValue={OnboardingTemplate.Custom}
          render={({ field }) => (
            <>
              <RadioSelect
                options={[
                  {
                    title: t('custom.title'),
                    description: t('custom.description'),
                    value: 'custom',
                    IconComponent: IcoLayer0124,
                  },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
              <Divider />
              <RadioSelect
                options={[
                  {
                    title: t('alpaca.title'),
                    description: t('alpaca.description'),
                    value: 'alpaca',
                    IconComponent: IcoAlpaca24,
                  },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            </>
          )}
        />
        <ButtonContainer>
          <Button variant="secondary" onClick={onBack}>
            {allT('back')}
          </Button>
          <Button variant="primary" type="submit">
            {allT('next')}
          </Button>
        </ButtonContainer>
      </Form>
    </Container>
  );
};

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

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;
export default OnboardingTemplates;
