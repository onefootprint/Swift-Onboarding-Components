import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import styled, { css } from '@onefootprint/styled';
import type { OnboardingConfigKind } from '@onefootprint/types';
import { Box, FootprintButton, media, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React, { useState } from 'react';

type PreviewProps = {
  obConfig: {
    org_name: string;
    logo_url: string;
    key: string;
    kind: OnboardingConfigKind;
  };
};

const Preview = ({ obConfig }: PreviewProps) => {
  const [showConfirmation, setConfirmation] = useState(false);
  const t = obConfig.kind === 'auth' ? translations.auth : translations.verify;

  const handleOpen = () => {
    const fp = footprint.init({
      kind: FootprintComponentKind.Auth,
      publicKey: obConfig.key,
      onComplete: (validationToken: string) => {
        console.log('validationToken', validationToken);
        setConfirmation(true);
      },
    });
    fp.render();
  };

  return (
    <>
      <Head>
        <title>Footprint Preview - {obConfig.org_name}</title>
      </Head>
      <Container>
        <Inner>
          {showConfirmation ? (
            <Box>
              <Typography
                color="primary"
                sx={{ marginBottom: 7 }}
                variant="heading-2"
              >
                {t.success.title}
              </Typography>
              <Typography color="secondary" variant="body-1" as="div">
                {t.success.body}
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="heading-1" as="h1" sx={{ marginBottom: 3 }}>
                {obConfig.org_name}
              </Typography>
              <Typography variant="body-1" color="secondary">
                {t.body}
              </Typography>
              <ButtonContainer>
                <FootprintButton onClick={handleOpen} text={t.cta} />
              </ButtonContainer>
            </>
          )}
        </Inner>
        <Typography color="tertiary" sx={{ marginTop: 7 }} variant="label-2">
          Footprint ❤️ {obConfig.org_name}
        </Typography>
      </Container>
    </>
  );
};

const translations = {
  auth: {
    body: ' This is a demo of Footprint’s authentication flow. We will collect some personal information, and the end of flow you will se a validation token printed to the console.',
    cta: 'Sign in with Footprint',
    success: {
      title: 'Authentication complete!',
      body: 'Thanks for trying Footprint. If you have any questions or want to learn more about our product, please contact us and we will get back to you as soon as possible.',
    },
  },
  verify: {
    body: 'This is a demo of Footprint’s verification flow. We will collect some personal information, and the end of flow you will se a validation token printed to the console.',
    cta: 'Verify with Footprint',
    success: {
      title: 'Onboarding complete!',
      body: 'Thanks for trying Footprint. If you have any questions or want to learn more about our product, please contact us and we will get back to you as soon as possible.',
    },
  },
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    background: ${theme.backgroundColor.secondary};
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: center;
    overflow: hidden;
    width: 100%;
  `}
`;

const Inner = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.compact};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    padding: ${theme.spacing[7]} ${theme.spacing[5]};
    text-align: center;
    width: 70%;

    ${media.greaterThan('sm')`
      max-width: 552px;
      padding: ${theme.spacing[9]};
    `}

    ${media.greaterThan('md')`
      max-width: 700px;
    `}
  `}
`;

const ButtonContainer = styled.div`
  margin: 0 auto;
`;

export default Preview;
