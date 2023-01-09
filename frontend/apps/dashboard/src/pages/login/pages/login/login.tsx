import { useTranslation } from '@onefootprint/hooks';
import { Box, Button, GoogleButton } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import TermsAndConditions from 'src/components/terms-and-conditions';
import styled, { css } from 'styled-components';

import LogoAndText from '../../components/logo-and-text';

const Login = () => {
  const { t } = useTranslation('pages.login');
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
        <Box sx={{ width: '350px' }}>
          <LogoAndText text={t('title')} />
        </Box>
        <Inner>
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
    width: 350px;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[5]};
  `}
`;

export default Login;
