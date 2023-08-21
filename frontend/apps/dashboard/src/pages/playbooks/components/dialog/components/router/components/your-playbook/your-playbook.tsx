import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, TextInput, Typography } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { Kind, PlaybookFormData } from '@/playbooks/utils/machine/types';

import DataCollection from './components/data-collection';

type YourPlaybookProps = {
  kind: Kind;
  onSubmit: (data: PlaybookFormData) => void;
  onBack: () => void;
  defaultValues: PlaybookFormData;
};

const YourPlaybook = ({
  kind,
  onSubmit,
  onBack,
  defaultValues,
}: YourPlaybookProps) => {
  const { t } = useTranslation('pages.playbooks.dialog.your-playbook');
  const formMethods = useForm<PlaybookFormData>({
    defaultValues,
  });
  const { handleSubmit, register } = formMethods;

  return (
    <Container>
      <Header>
        <Typography variant="label-1">{t('title')}</Typography>
        <Typography variant="body-2">{t('subtitle')}</Typography>
      </Header>
      <FormProvider {...formMethods}>
        <Form id="your-playbook-form" onSubmit={handleSubmit(onSubmit)}>
          <NameYourPlaybook>
            <Typography variant="label-2">
              {t('name-your-playbook.title')}
            </Typography>
            <Typography variant="body-3">
              {t('name-your-playbook.subtitle')}
            </Typography>
          </NameYourPlaybook>
          <TextInput
            autoFocus
            {...register('name')}
            label={t('form.name.label')}
            placeholder={t('form.name.placeholder')}
          />
          <DataCollection kind={kind} />
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
  `};
`;

const NameYourPlaybook = styled.div`
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

export default YourPlaybook;
