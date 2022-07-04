import { useTranslation } from 'hooks';
import React from 'react';
import { useForm } from 'react-hook-form';
import HeaderTitle from 'src/components/header-title';
import NavigationHeader from 'src/components/navigation-header';
import { UserData, UserDataAttribute } from 'src/utils/state-machine/types';
import styled, { css } from 'styled-components';
import { Button, TextInput } from 'ui';

import useEmailIdentify from './hooks/use-email-identify';

type FormData = Required<Pick<UserData, UserDataAttribute.email>>;

const EmailIdentification = () => {
  const { t } = useTranslation('pages.email-identification');
  const { identifyEmail, isLoading } = useEmailIdentify();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (formData: FormData) => {
    identifyEmail(formData.email);
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'close' }} />
      <HeaderTitle
        subtitle={t('subtitle')}
        sx={{ marginBottom: 8 }}
        title={t('title')}
      />
      <Form onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          hasError={!!errors.email}
          hintText={errors.email && t('form.email.error')}
          label={t('form.email.label')}
          placeholder={t('form.email.placeholder')}
          type="email"
          {...register('email', { required: true })}
        />
        <Button fullWidth type="submit" loading={isLoading()}>
          {t('form.cta')}
        </Button>
      </Form>
    </>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;

export default EmailIdentification;
