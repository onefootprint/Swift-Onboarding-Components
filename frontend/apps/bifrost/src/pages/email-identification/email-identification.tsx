import React from 'react';
import { useForm } from 'react-hook-form';
import { UserData, UserDataAttribute } from 'src/utils/state-machine/types';
import styled, { css } from 'styled-components';
import { Button, TextInput } from 'ui';

import HeaderTitle from '../../components/header-title';
import useEmailIdentify from './hooks/use-email-identify';

type FormData = Required<Pick<UserData, UserDataAttribute.email>>;

const EmailIdentification = () => {
  const { identifyEmail, isLoading } = useEmailIdentify();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (formData: FormData) => {
    const { email } = formData;
    identifyEmail(email);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <HeaderTitle
        title="Hey there! 👋"
        subtitle="Enter your email to get started."
      />
      <TextInput
        autoFocus
        hasError={!!errors.email}
        hintText={errors.email && 'Email is required'}
        label="Email"
        placeholder="your.email@email.com"
        type="email"
        {...register('email', { required: true })}
      />
      <Button fullWidth type="submit" loading={isLoading()}>
        Continue
      </Button>
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;

export default EmailIdentification;
