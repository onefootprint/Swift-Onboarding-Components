import { useTranslation } from 'hooks';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';
import { Button, GoogleButton, LinkButton, Typography } from 'ui';

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
        <LogoAndText text={t('title')} />
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
          <TextContainer>
            <Typography variant="caption-2" color="tertiary">
              By continuing you agree to our
            </Typography>
            <Link href="https://onefootprint.com/terms-of-service" passHref>
              <LinkButton size="xxTiny" target="_blank">
                Terms of Service
              </LinkButton>
            </Link>
            <Typography variant="caption-2" color="tertiary">
              and
            </Typography>
            <Link href="https://onefootprint.com/privacy-policy" passHref>
              <LinkButton size="xxTiny" target="_blank">
                Privacy Policy.
              </LinkButton>
            </Link>
          </TextContainer>
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
    row-gap: ${theme.spacing[5]}px;
  `}
`;

const TextContainer = styled.div`
  text-align: center;

  > * {
    display: inline;
    margin-right: ${({ theme }) => theme.spacing[2]}px;
  }
`;

export default Login;
