import { Box, Container, createFontStyles, media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import ContactButtons from './components/contact-buttons';

type PenguinBannerProps = {
  imgSrc?: string;
};

const PenguinBanner = ({
  imgSrc = '/home/penguin-banner/onboard.jpg',
}: PenguinBannerProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.industries.fintech.banner',
  });

  return (
    <Background>
      <BannerContainer>
        <Illustration
          src={imgSrc}
          height={600}
          width={900}
          alt={t('alt-img')}
        />
        <TextContainer>
          <Title>{t('title')}</Title>
          <ContactButtons
            primaryButton={t('primary-button')}
            secondaryButton={t('secondary-button')}
            justify="left"
          />
        </TextContainer>
      </BannerContainer>
    </Background>
  );
};

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
      gap: ${theme.spacing[9]};
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

  ${media.greaterThan('md')`
    height: 50%;
    max-width: 45%;
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
  `}
`;

export default PenguinBanner;
