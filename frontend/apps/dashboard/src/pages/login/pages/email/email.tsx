import { ThemedLogoFpDefault } from '@onefootprint/icons';
import type { OrgAuthMagicLinkRequest } from '@onefootprint/types';
import { Button, Grid, Stack, Text, TextInput } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BackButton from '../../components/back-button';
import useLoginEmail from './hooks/use-login-email';

type FormData = {
  email: string;
};

const EmailLogin = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.email-login' });
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
          <Grid.Container gap={7}>
            <Stack align="center" justify="center" gap={7} direction="column">
              <ThemedLogoFpDefault />
              <Text variant="label-1" color="primary">
                {t('title')}
              </Text>
            </Stack>
            <TextInput
              hasError={!!errors.email}
              hint={errors?.email?.message}
              label={t('form.email.label')}
              placeholder="jane.doe@acme.com"
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
            <Text
              variant="caption-2"
              color="tertiary"
              maxWidth="350px"
              textAlign="center"
            >
              {t('instructions')}
            </Text>
          </Grid.Container>
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

export default EmailLogin;
