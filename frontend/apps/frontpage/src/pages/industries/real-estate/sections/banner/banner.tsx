import { Box, Container, createFontStyles, media } from '@onefootprint/ui';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Ctas from 'src/components/ctas';

type PenguinBannerProps = {
  imgSrc?: string;
};

const PenguinBanner = ({ imgSrc = '/home/banner/penguin-complete.svg' }: PenguinBannerProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.industries.real-estate.banner',
  });

  return (
    <Background>
      <BannerContainer>
        <Illustration src={imgSrc} height={600} width={600} alt={t('alt-img')} />
        <TextContainer>
          <Title>{t('title')}</Title>
          <Ctas
            labels={{
              primary: t('primary-button'),
              secondary: t('secondary-button'),
            }}
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
      gap: ${theme.spacing[10]};
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
    max-width: 50%;
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
    max-width: 75%;
  `}
`;

export default PenguinBanner;
