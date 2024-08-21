import { Stack, Text, createFontStyles, media } from '@onefootprint/ui';
import Image from 'next/image';
import type React from 'react';
import styled, { css } from 'styled-components';

type QuoteProps = {
  children: React.ReactNode;
  author: string;
  role: string;
};

const Quote = ({ children, author, role }: QuoteProps) => (
  <Container direction="column" gap={7}>
    <blockquote>{children}</blockquote>
    <SignatureContainer>
      <LogoContainer flex={1}>
        <Image src="/customers-logos/bloom.png" alt="Bloom" height={32} width={110} />
      </LogoContainer>
      <Divider />
      <Stack direction="column" align="start" flex={1}>
        <Text variant="body-2">{author}</Text>
        <Text variant="body-2" color="tertiary">
          ({role})
        </Text>
      </Stack>
    </SignatureContainer>
  </Container>
);

const Container = styled(Stack)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.success};
    padding: ${theme.spacing[7]};
    border-radius: ${theme.borderRadius.default};
    margin-bottom: ${theme.spacing[8]};

    p {
      margin: 0;
    }

    blockquote {
      p {
        ${createFontStyles('display-4')}
      }
    }

    ${media.greaterThan('md')`
      text-align: center;
      padding: ${theme.spacing[8]};
    `}
  `}
`;

const Divider = styled.div`
  ${({ theme }) => css`
    width: 1px;
    height: 32px;
    background-color: ${theme.borderColor.tertiary};
    display: none;

    ${media.greaterThan('md')`
      display: block;
    `}
  `}
`;

const SignatureContainer = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column-reverse;
    align-items: start;
    gap: ${theme.spacing[4]};

    ${media.greaterThan('md')`
        gap: ${theme.spacing[7]};
        flex-direction: row;
        align-items: center;
        justify-content: center;
    `};
  `}
`;
const LogoContainer = styled(Stack)`
  align-items: end;
  justify-content: end;
  width: 95px;
  height: 28px;

  ${media.greaterThan('md')`
    width: 110px;
    height: 32px;
  `}

  img {
    object-fit: contain;
    max-width: 100%;
    max-height: 100%;
  }
`;

export default Quote;
