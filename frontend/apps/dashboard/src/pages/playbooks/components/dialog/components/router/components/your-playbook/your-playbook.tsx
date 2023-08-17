import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { TextInput, Typography } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import DataCollection from './components/data-collection';
import { defaultValues, FormData } from './your-playbook.types';

const YourPlaybook = () => {
  const { t } = useTranslation('pages.playbooks.dialog.your-playbook');
  const formMethods = useForm<FormData>({ defaultValues });
  const { handleSubmit, register } = formMethods;

  // should come from props later
  const onSubmit = () => {
    console.log('whoopee');
  };

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
          <DataCollection />
        </Form>
      </FormProvider>
    </Container>
  );
};

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
