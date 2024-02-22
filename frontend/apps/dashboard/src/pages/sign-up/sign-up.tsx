import { LogoFpDefault } from '@onefootprint/icons';
import { Button, GoogleButton, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import TermsAndConditions from 'src/components/terms-and-conditions';
import styled, { css } from 'styled-components';

const Login = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.sign-up' });
  const router = useRouter();

  const handleGoggleButtonClick = () => {
    const redirect = `${window.location.origin}/auth`;
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/auth/google_oauth?redirect_url=${redirect}`;
    window.location.href = url;
  };

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Container>
        <Inner>
          <LogoFpDefault />
          <Typography variant="label-1" color="primary">
            {t('title')}
          </Typography>
          <ButtonsContainer>
            <GoogleButton
              fullWidth
              type="submit"
              onClick={handleGoggleButtonClick}
            >
              {t('google')}
            </GoogleButton>
            <Button
              onClick={() => router.push('/login/email')}
              variant="secondary"
              fullWidth
            >
              {t('email')}
            </Button>
          </ButtonsContainer>
          <TermsAndConditions />
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
