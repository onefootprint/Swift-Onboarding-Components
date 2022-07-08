import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';
import { Button, GoogleButton, LinkButton, Typography } from 'ui';

import LogoAndText from '../../components/logo-and-text';
import useLoginGoogle, { GoogleLoginResponse } from './hooks/use-login-google';

const Login = () => {
  const router = useRouter();
  const loginGoogle = useLoginGoogle();

  const handleGoggleButtonClick = () => {
    loginGoogle.mutate(undefined, {
      onSuccess({ redirectUrl }: GoogleLoginResponse) {
        window.location.href = redirectUrl;
      },
    });
  };

  return (
    <Container>
      <LogoAndText text="Sign up or Log in" />
      <Inner>
        <GoogleButton
          fullWidth
          type="submit"
          onClick={handleGoggleButtonClick}
          loading={loginGoogle.isLoading}
        >
          Continue with Google
        </GoogleButton>
        <Button
          onClick={() => router.push('/login/email')}
          variant="secondary"
          fullWidth
        >
          Continue with email
        </Button>
        <TextContainer>
          <Typography variant="caption-2" color="tertiary">
            By continuing you agree to our
          </Typography>
          <LinkButton
            size="xxTiny"
            href="https://onefootprint.com/terms-of-service"
            target="_blank"
          >
            Terms of Service
          </LinkButton>
          <Typography variant="caption-2" color="tertiary">
            and
          </Typography>
          <LinkButton
            size="xxTiny"
            href="https://onefootprint.com/privacy-policy"
            target="_blank"
          >
            Privacy Policy.
          </LinkButton>
        </TextContainer>
      </Inner>
    </Container>
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
