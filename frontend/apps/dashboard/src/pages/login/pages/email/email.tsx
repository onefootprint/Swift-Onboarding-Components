import { useRouter } from 'next/router';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled';
import { Button, TextInput, Typography } from 'ui';

import BackButton from '../../components/back-button/back-button';
import LogoAndText from '../../components/logo-and-text';
import useLoginEmail, {
  EmailLoginRequest,
  EmailLoginResponse,
} from './hooks/use-login-email';

type FormData = {
  emailAddress: string;
};

const EmailLogin = () => {
  const router = useRouter();

  const mutateLoginEmail = useLoginEmail();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (formData: FormData) => {
    const { emailAddress } = formData;
    const request: EmailLoginRequest = {
      emailAddress,
    };
    mutateLoginEmail.mutate(request, {
      onSuccess({ success }: EmailLoginResponse) {
        if (success) {
          router.push({
            pathname: '/login/link-sent',
            query: { email_address: emailAddress },
          });
        } else {
          // TODO: handle error
        }
      },
    });
  };

  return (
    <>
      <BackButton />
      <Container>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <LogoAndText text="Sign up or Log in" />
          <Inner>
            <TextInput
              hasError={!!errors.emailAddress}
              hintText={errors.emailAddress && 'Email is required'}
              label="Email"
              placeholder="your.email@email.com"
              type="email"
              {...register('emailAddress', { required: true })}
            />
            <Button
              fullWidth
              type="submit"
              loading={mutateLoginEmail.isLoading}
            >
              Continue
            </Button>
            <Typography
              variant="caption-2"
              color="tertiary"
              sx={{ maxWidth: '350px', textAlign: 'center' }}
            >
              No passwords, no problems. We&apos;ll send you an email with a
              direct login link for a seamless and secure experience.
            </Typography>
          </Inner>
        </Form>
      </Container>
    </>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
`;

const Form = styled.form`
  width: 350px;
`;

const Inner = styled.div`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[5]}px;
  `}
`;

export default EmailLogin;
