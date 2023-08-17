import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { TextInput, Typography } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import PersonalInfoAndDocs from './components/personal-info-and-docs';

export type PersonalInformationAndDocs = {
  email: boolean;
  phone: boolean;
  dob: boolean;
  nationality: boolean;
  address: boolean;
  ssn: boolean;
  ssnKind?: CollectedKycDataOption.ssn4 | CollectedKycDataOption.ssn9;
  idDoc: boolean;
  idDocKind: SupportedIdDocTypes[];
  selfie?: boolean;
  ssnOptional?: boolean;
};

export type FormData = {
  name: string;
  personalInformationAndDocs: PersonalInformationAndDocs;
};

export const defaultValues: FormData = {
  name: '',
  personalInformationAndDocs: {
    email: true,
    phone: true,
    dob: true,
    nationality: true,
    address: true,
    ssn: false,
    idDoc: false,
    ssnKind: CollectedKycDataOption.ssn9,
    idDocKind: [],
    selfie: true,
  },
};

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
          <PersonalInfoAndDocs />
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
