import React from 'react';
import { useForm } from 'react-hook-form';
import useIdentifyEmail from 'src/hooks/use-identify-email';
import styled, { css } from 'styled';
import { Button, TextInput, Typography } from 'ui';

type FormData = {
  email: string;
};

const EmailIdentification = () => {
  const identifyEmailMutation = useIdentifyEmail();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (formData: FormData) => {
    // TODO:
    console.log(formData);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <TextContainer>
        <Typography variant="heading-2" color="primary">
          Hey there! 👋
        </Typography>
        <Typography variant="body-2" color="secondary">
          Enter your email to get started.
        </Typography>
      </TextContainer>
      <TextInput
        hasError={!!errors.email}
        hintText={errors.email && 'Email is required'}
        label="Email"
        placeholder="your.email@email.com"
        type="email"
        {...register('email', { required: true })}
      />
      <Button fullWidth type="submit" loading={identifyEmailMutation.isLoading}>
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

const TextContainer = styled.div`
  text-align: center;
`;

export default EmailIdentification;
