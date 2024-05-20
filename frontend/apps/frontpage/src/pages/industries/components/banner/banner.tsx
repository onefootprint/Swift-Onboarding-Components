import { Box, Container, createFontStyles, media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

import ContactButtons from './components/contact-buttons';

type PenguinBannerProps = {
  imgSrc?: string;
  title: string;
  primaryButton: string;
  secondaryButton: string;
};

const PenguinBanner = ({
  imgSrc = '/home/banner/penguin-complete.svg',
  title,
  primaryButton,
  secondaryButton,
}: PenguinBannerProps) => (
  <Background>
    <BannerContainer>
      <Illustration src={imgSrc} height={600} width={900} alt={title} />
      <TextContainer>
        <Title>{title}</Title>
        <ContactButtons
          primaryButton={primaryButton}
          secondaryButton={secondaryButton}
          justify="left"
        />
      </TextContainer>
    </BannerContainer>
  </Background>
);

const Background = styled(Box)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.secondary};
  `}
`;

const Title = styled.h2<{ isDarkTheme?: boolean }>`
  ${({ theme, isDarkTheme }) => css`
    color: ${isDarkTheme ? theme.color.quinary : theme.color.primary};
    ${createFontStyles('display-3')}
    text-align: center;

    ${media.greaterThan('md')`
      ${createFontStyles('display-2')}
      text-align: left;
    `}
  `}
`;

const BannerContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    padding: ${theme.spacing[11]} 0;
    gap: ${theme.spacing[10]};
    align-items: center;
    justify-content: center;

    ${media.greaterThan('md')`
      gap: ${theme.spacing[11]};
      padding: ${theme.spacing[11]} 0 ${theme.spacing[14]} 0;
      flex-direction: row;
    `}
  `}
`;

const Illustration = styled(Image)`
  object-fit: cover;
  height: 400px;
  max-width: 100%;
  border-radius: 10px;

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }

  ${media.greaterThan('md')`
    height: 50%;
    max-width: 30%;
  `}
`;

const TextContainer = styled(Box)`
  ${({ theme }) => css`
    width: 100%;
    gap: ${theme.spacing[9]};
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;

    ${media.greaterThan('md')`
      max-width: 75%;
    `}
  `}
`;

export default PenguinBanner;
