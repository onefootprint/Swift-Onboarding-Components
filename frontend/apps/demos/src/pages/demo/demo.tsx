import footprint from 'footprint';
import Head from 'next/head';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { Box, createFontStyles, FootprintButton, media, Typography } from 'ui';

footprint.init({ publicKey: process.env.NEXT_PUBLIC_TENANT_KEY });

export type DemoProps = {
  page: {
    id: string;
    slug: string;
    title: string;
    html: string;
    feature_image: string;
    meta_title: string;
  };
};

const Demo = ({ page }: DemoProps) => {
  const [showConfirmation, setConfirmation] = useState(false);

  const handleClick = () => {
    footprint.show({
      onCompleted(footprintUserId) {
        console.log('footprintUserId', footprintUserId);
        setConfirmation(true);
      },
    });
  };

  return (
    <>
      <Head>
        <title>{page.meta_title || 'Footprint Demo'}</title>
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
              <Content dangerouslySetInnerHTML={{ __html: page.html }} />
              <ButtonContainer>
                <FootprintButton fullWidth onClick={handleClick} />
              </ButtonContainer>
            </>
          )}
        </Inner>
        <Typography color="tertiary" sx={{ marginTop: 7 }} variant="label-2">
          Footprint ❤️ {page.title}
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

const Content = styled.div`
  ${({ theme }) => css`
    img {
      margin-bottom: ${theme.spacing[7]}px;
    }

    h1,
    h2,
    h3 {
      ${createFontStyles('heading-2')};
      color: ${theme.color.primary};
      margin-bottom: ${theme.spacing[7]}px;
    }

    p {
      ${createFontStyles('body-1')};
      color: ${theme.color.secondary};
    }
  `}
`;

const ButtonContainer = styled.div`
  width: 100%;
  margin: 0 auto;

  ${media.greaterThan('sm')`
    width: 380px;
  `}
`;

export default Demo;
