import { Box, Container, Stack, createFontStyles, media } from '@onefootprint/ui';
import dynamic from 'next/dynamic';
import Image from 'next/image';

import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Ctas from 'src/components/ctas';
import CustomersLogos from './components/customers-logos';

const Screen = dynamic(() => import('./components/screen'));

const Hero = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.home' });

  return (
    <>
      <BackgroundContainer>
        <Overflow>
          <HeroContainer>
            <TextContainer>
              <Title tag="h1">{t('hero.title')}</Title>
              <Subtitle tag="h2" textAlign="center">
                {t('hero.subtitle')}
              </Subtitle>
              <Ctas />
            </TextContainer>
            <Screen />
            <CustomersLogos />
          </HeroContainer>
        </Overflow>
        <Background
          src="/home/hero/background-texture.png"
          alt="background texture"
          height={600}
          width={600}
          priority
        />
      </BackgroundContainer>
    </>
  );
};

const Background = styled(Image)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 60%;
  object-fit: cover;
  isolation: isolate;
  z-index: -1;
  opacity: 0.5;
`;

const Title = styled(Box)`
  ${createFontStyles('display-2')}
  text-align: center;
  max-width: 580px;

  ${media.greaterThan('md')`
    ${createFontStyles('display-1')}
  `}
`;

const Subtitle = styled(Box)`
  ${createFontStyles('display-4')}
  text-align: center;
  max-width: 520px;
`;

const Overflow = styled.div`
  overflow: hidden;
`;

const HeroContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    position: relative;
    gap: ${theme.spacing[11]};
    padding: ${theme.spacing[9]} 0;
    align-items: center;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[11]} 0;
    `}
  `}
`;

const TextContainer = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[5]};
    z-index: 1;
  `}
`;

const BackgroundContainer = styled.div`
  position: relative;
`;

export default Hero;
