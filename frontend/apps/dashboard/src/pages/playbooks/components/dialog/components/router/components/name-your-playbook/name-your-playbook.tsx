import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, TextInput, Typography } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { NameFormData } from '@/playbooks/utils/machine/types';

type NameYourPlaybookProps = {
  onSubmit: (data: NameFormData) => void;
  onBack: () => void;
  defaultValues: NameFormData;
};

const NameYourPlaybook = ({
  onSubmit,
  onBack,
  defaultValues,
}: NameYourPlaybookProps) => {
  const { t } = useTranslation('pages.playbooks.dialog.name-your-playbook');
  const formMethods = useForm<NameFormData>({
    defaultValues,
  });
  const { handleSubmit, register } = formMethods;

  return (
    <Container>
      <FormProvider {...formMethods}>
        <Form id="your-playbook-form" onSubmit={handleSubmit(onSubmit)}>
          <Header>
            <Typography variant="label-1">{t('title')}</Typography>
            <Typography variant="body-2">{t('subtitle')}</Typography>
          </Header>
          <TextInput
            autoFocus
            {...register('name')}
            label={t('form.name.label')}
            placeholder={t('form.name.placeholder')}
          />
          <ButtonContainer>
            <Button size="compact" variant="secondary" onClick={onBack}>
              {t('back')}
            </Button>
            <Button size="compact" type="submit">
              {t('next')}
            </Button>
          </ButtonContainer>
        </Form>
      </FormProvider>
    </Container>
  );
};

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    padding-top: ${theme.spacing[5]};
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  `};
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

export default NameYourPlaybook;
