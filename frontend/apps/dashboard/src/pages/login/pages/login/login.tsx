import { ThemedLogoFpDefault } from '@onefootprint/icons';
import type { NextToast } from '@onefootprint/ui';
import { Button, GoogleButton, Text, useToast } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFilters from 'src/hooks/use-filters';
import useLoggedOutStorage from 'src/hooks/use-logged-out-storage';
import styled, { css } from 'styled-components';

type LoginFilters = {
  orgId?: string;
};

const Login = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.login' });
  const router = useRouter();
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const toast = useToast();
  const { query, isReady } = useFilters<LoginFilters>({});
  const { setOrgId, data } = useLoggedOutStorage();
  useEffect(() => {
    if (!isReady || data.orgId === query.orgId) {
      return;
    }
    setOrgId(query.orgId);
    // Save the orgId from the querystring into local storage
  }, [isReady, query, setOrgId, data]);

  const getErrorTexts = (
    type: 'google-description' | 'email-description',
  ): NextToast => ({
    description: t(`pages.login.login-errors.${type}`),
    title: t('pages.login.login-errors.title'),
    variant: 'error',
  });

  const handleGoogleButtonClick = async () => {
    setIsLoadingGoogle(true);
    try {
      const redirect = `${window.location.origin}/auth`;
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/auth/google_oauth?redirect_url=${redirect}`;
      window.location.href = url;
    } catch (error) {
      toast.show(getErrorTexts('google-description'));
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleEmailButtonClick = async () => {
    setIsLoadingEmail(true);
    try {
      await router.push('/login/email');
    } catch (error) {
      toast.show(getErrorTexts('email-description'));
    } finally {
      setIsLoadingEmail(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Container>
        <Inner>
          <ThemedLogoFpDefault color="primary" />
          <Text variant="label-1" color="primary">
            {t('title')}
          </Text>
          <ButtonsContainer>
            <GoogleButton
              fullWidth
              type="submit"
              onClick={handleGoogleButtonClick}
              size="large"
              loading={isLoadingGoogle}
            >
              {t('google')}
            </GoogleButton>
            <Button
              onClick={handleEmailButtonClick}
              variant="secondary"
              fullWidth
              size="large"
              loading={isLoadingEmail}
            >
              {t('email')}
            </Button>
          </ButtonsContainer>
        </Inner>
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

const Inner = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    text-align: center;
    width: 350px;
  `}
`;

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    width: 100%;
  `}
`;

export default Login;
