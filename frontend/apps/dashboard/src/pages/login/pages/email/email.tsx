import { useTranslation } from '@onefootprint/hooks';
import { OrgAuthMagicLinkRequest } from '@onefootprint/types';
import { Button, TextInput, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import BackButton from '../../components/back-button/back-button';
import LogoAndText from '../../components/logo-and-text';
import useLoginEmail from './hooks/use-login-email';

type FormData = {
  email: string;
};

const EmailLogin = () => {
  const { t } = useTranslation('pages.email-login');
  const router = useRouter();
  const mutateLoginEmail = useLoginEmail();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = ({ email }: FormData) => {
    const request: OrgAuthMagicLinkRequest = {
      emailAddress: email,
      redirectUrl: `${window.location.origin}/auth`,
    };
    mutateLoginEmail.mutate(request, {
      onSuccess() {
        router.push({
          pathname: '/login/link-sent',
          query: { email },
        });
      },
    });
  };

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <BackButton />
      <Container>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <LogoAndText text={t('title')} />
          <Inner>
            <TextInput
              hasError={!!errors.email}
              hint={errors?.email?.message}
              label={t('form.email.label')}
              placeholder="your.email@email.com"
              type="email"
              {...register('email', {
                required: {
                  value: true,
                  message: t('form.email.errors.required'),
                },
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: t('form.email.errors.pattern'),
                },
              })}
            />
            <Button
              fullWidth
              type="submit"
              loading={mutateLoginEmail.isLoading}
            >
              {t('form.cta')}
            </Button>
            <Typography
              variant="caption-2"
              color="tertiary"
              sx={{ maxWidth: '350px', textAlign: 'center' }}
            >
              {t('instructions')}
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
