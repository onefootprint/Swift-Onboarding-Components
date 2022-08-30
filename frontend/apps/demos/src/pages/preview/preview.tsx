import footprint from '@onefootprint/footprint-js';
import Head from 'next/head';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { Box, FootprintButton, media, Typography } from 'ui';

type PreviewProps = {
  tenant: {
    org_name: string;
    logo_url: string;
    key: string;
  };
};

const Preview = ({ tenant }: PreviewProps) => {
  const [showConfirmation, setConfirmation] = useState(false);

  const handleClick = () => {
    footprint.init({ publicKey: tenant.key });
    footprint.show({
      onCompleted(validationToken) {
        console.log('validationToken', validationToken);
        setConfirmation(true);
      },
    });
  };

  return (
    <>
      <Head>
        <title>Footprint Preview - {tenant.org_name}</title>
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
                Onboarding complete!
              </Typography>
              <Typography color="secondary" variant="body-1" as="div">
                Thanks for trying Footprint. If you have any questions or want
                to learn more about our product, please contact us and we will
                get back to you as soon as possible.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="heading-1" as="h1" sx={{ marginBottom: 3 }}>
                {tenant.org_name}
              </Typography>
              <Typography variant="heading-2" as="h2">
                Help us verify your identity
              </Typography>
              <Typography variant="body-1" color="secondary">
                We will need to collect some personal information to confirm and
                protect your identity when you create your account at{' '}
                {tenant.org_name}. To learn more about how we process this data,
                please see our privacy policy.
              </Typography>
              <ButtonContainer>
                <FootprintButton fullWidth onClick={handleClick} />
              </ButtonContainer>
            </>
          )}
        </Inner>
        <Typography color="tertiary" sx={{ marginTop: 7 }} variant="label-2">
          Footprint ❤️ {tenant.org_name}
        </Typography>
      </Container>
    </>
  );
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
    border-radius: ${theme.borderRadius[1]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[9]}px;
    padding: ${theme.spacing[7]}px ${theme.spacing[5]}px;
    text-align: center;
    width: 90%;

    ${media.greaterThan('sm')`
      max-width: 552px;
      padding: ${theme.spacing[9]}px;
    `}

    ${media.greaterThan('md')`
      max-width: 700px;
    `}
  `}
`;

const ButtonContainer = styled.div`
  width: 100%;
  margin: 0 auto;

  ${media.greaterThan('sm')`
    width: 380px;
  `}
`;

export default Preview;
