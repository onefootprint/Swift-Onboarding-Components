import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { Box, Button, Container, Stack, createFontStyles, media } from '@onefootprint/ui';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React, { useCallback, useState } from 'react';
import { GET_FORM_URL, SIGN_UP_URL } from 'src/config/constants';

import { useTranslation } from 'react-i18next';
// eslint-disable-next-line import/no-extraneous-dependencies
import ContactDialog from 'src/components/contact-dialog';
import styled, { css } from 'styled-components';

import CustomersLogos from './components/customers-logos';

const Screen = dynamic(() => import('./components/screen'));

const Hero = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { t } = useTranslation('common', { keyPrefix: 'pages.home' });

  const handleSignUpClick = () => {
    window.open(SIGN_UP_URL, '_blank');
  };

  const handleBookCall = useCallback(() => {
    setShowDialog(true);
  }, []);

  return (
    <BackgroundContainer>
      <Overflow>
        <HeroContainer>
          <TextContainer>
            <Stack direction="column" gap={5} align="center">
              <Title tag="h1">{t('hero.title')}</Title>
              <Subtitle tag="h2" textAlign="center">
                {t('hero.subtitle')}
              </Subtitle>
            </Stack>
            <Stack direction="row" gap={5} marginTop={3}>
              <Button variant="primary" size="large" onClick={handleSignUpClick}>
                {t('hero.get-started')}
              </Button>
              <Button variant="secondary" size="large" onClick={handleBookCall}>
                {t('hero.book-a-call')}
              </Button>
            </Stack>
          </TextContainer>
          <Screen />
          <CustomersLogos />
        </HeroContainer>
      </Overflow>
      <ContactDialog url={GET_FORM_URL} open={showDialog} onClose={() => setShowDialog(false)} />
      <Background src="/home/hero/background-texture.png" alt="background texture" height={600} width={600} priority />
    </BackgroundContainer>
  );
};

const Background = styled(Image)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 60%;
  object-fit: cover;
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
    gap: ${theme.spacing[7]};
    z-index: 5;
  `}
`;

const BackgroundContainer = styled.div`
  position: relative;
`;

export default Hero;
