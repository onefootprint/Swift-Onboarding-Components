import { useTranslation } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import useUserSession from 'src/hooks/use-user-session';
import styled, { css } from 'styled-components';

import Header from '../header';

export type UserDataProps = {
  id: string;
  onComplete: () => void;
};

type FormData = {
  name: string;
};

const UserData = ({ id, onComplete }: UserDataProps) => {
  const { dangerouslyCastedData } = useUserSession();
  const { t } = useTranslation('pages.onboarding.user-data');
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const handleSubmit = (formData: FormData) => {
    console.log(formData);
    onComplete();
  };

  return (
    <Container>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <Form id={id} onSubmit={handleFormSubmit(handleSubmit)}>
        <TextInput
          disabled
          label={t('form.email.label')}
          placeholder={t('form.email.placeholder')}
          type="email"
          value={dangerouslyCastedData.email}
        />
        <TextInput
          hasError={!!errors.name}
          hint={errors.name ? t('form.name.errors.required') : undefined}
          label={t('form.name.label')}
          placeholder={t('form.name.placeholder')}
          {...register('name', {
            required: {
              value: true,
              message: t('form.name.errors.required'),
            },
          })}
        />
      </Form>
    </Container>
  );
};

const Container = styled.header`
  ${({ theme }) => css`
    padding: ${theme.spacing[8]} ${theme.spacing[7]} ${theme.spacing[7]};
  `}
`;

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

export default UserData;
