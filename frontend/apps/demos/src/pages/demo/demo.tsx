import {
  FootprintAppearance,
  FootprintButton,
} from '@onefootprint/footprint-react';
import { Box, createFontStyles, media, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

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

const appearance: FootprintAppearance = {
  theme: 'light',
  variables: {
    dialog: {
      bg: '#fff',
      elevation: '0px 1px 4px 0px rgba(0, 0, 0, 0.12156862745098039)',
      borderRadius: '6px',
    },
    fpButton: {
      height: '48px',
      borderRadius: '6px',
    },
    loading: {
      bg: 'rgba(0, 0, 0, 0.6)',
      color: '#fff',
      borderRadius: '4px',
      padding: '16px',
    },
    overlay: {
      bg: 'rgba(0, 0, 0, 0.3)',
    },
  },
};

const publicKey = process.env.NEXT_PUBLIC_TENANT_KEY as string;

const Demo = ({ page }: DemoProps) => {
  const [showConfirmation, setConfirmation] = useState(false);

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
                <FootprintButton
                  appearance={appearance}
                  publicKey={publicKey}
                  onCompleted={(validationToken: string) => {
                    setConfirmation(true);
                    console.log('on completed', validationToken);
                  }}
                  onCanceled={() => {
                    console.log('user canceled!');
                  }}
                />
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
    border-radius: ${theme.borderRadius.compact}px;
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
  margin: 0 auto;
`;

export default Demo;
