import { media, Text } from '@onefootprint/ui';
import Head from 'next/head';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import Form from './components/form';
import Success from './components/success';

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
  const handleSuccess = () => {
    setConfirmation(true);
  };

  return page ? (
    <>
      <Head>
        <title>{page.meta_title || 'Footprint Demo'}</title>
      </Head>
      <Container>
        <Inner>
          {showConfirmation ? (
            <Success />
          ) : (
            <Form html={page.html} onSuccess={handleSuccess} />
          )}
        </Inner>
        <Text color="tertiary" marginTop={7} variant="label-2">
          Footprint ❤️ {page.title}
        </Text>
      </Container>
    </>
  ) : null;
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
    border-radius: ${theme.borderRadius.sm};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[9]};
    padding: ${theme.spacing[7]} ${theme.spacing[5]};
    text-align: center;
    width: 90%;

    ${media.greaterThan('sm')`
      max-width: 552px;
      padding: ${theme.spacing[9]};
    `}

    ${media.greaterThan('md')`
      max-width: 700px;
    `}
  `}
`;

export default Demo;
