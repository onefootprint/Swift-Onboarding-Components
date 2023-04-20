import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { IcoCirclePlay24 } from '@onefootprint/icons';
import {
  Box,
  Button,
  Container,
  LinkButton,
  media,
  Typography,
} from '@onefootprint/ui';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import ContactDialog from 'src/components/contact-dialog';
import LinkingButton from 'src/components/linking-button';
import styled, { css } from 'styled-components';

import HeroBackground from './components/background';
import DemoVideo from './components/demo-video';

const DynamicDesktopIllustration = dynamic(
  () => import('./components/desktop-illustration'),
);
const DynamicTabletIllustration = dynamic(
  () => import('./components/tablet-illustration'),
);

const DynamicMobileIllustration = dynamic(
  () => import('./components/mobile-illustration'),
);

const DEMO_LINK = 'https://www.youtube.com/embed/ylHZgcW3fyI?autoplay=1';
const GET_FORM_URL =
  'https://getform.io/f/9f26eb67-51b3-4685-8dc4-8cf458e698e1';

const containerMotion = {
  hidden: { opacity: 0.8 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
};

const Hero = () => {
  const { t } = useTranslation('pages.home.hero');
  const [isDemoVisible, setDemoVisible] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleClickTrigger = () => {
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
  };

  const toggleDemo = () => {
    setDemoVisible(!isDemoVisible);
  };

  return (
    <HeroContainer>
      <HeroBackground />
      <NoiseLayer />
      <Container as="section" id="hero">
        <Inner
          as={motion.div}
          variants={containerMotion}
          initial="hidden"
          animate="visible"
        >
          <Content>
            <Box sx={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
              <ResponsiveHide data-viewport="tablet-desktop">
                <Typography as="h1" color="primary" variant="display-1">
                  {t('title')}
                </Typography>
              </ResponsiveHide>
              <ResponsiveHide data-viewport="mobile">
                <Typography as="h1" color="primary" variant="display-2">
                  {t('title')}
                </Typography>
              </ResponsiveHide>
              <Typography as="h2" color="primary" variant="display-4">
                {t('subtitle')}
              </Typography>
            </Box>
            <DynamicMobileIllustration />
            <DynamicTabletIllustration />
            <ButtonsContainer>
              <Row>
                <LinkingButton href={`${DASHBOARD_BASE_URL}/sign-up`}>
                  {t('primary-button')}
                </LinkingButton>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClickTrigger}
                >
                  {t('secondary-button')}
                </Button>
                <ContactDialog
                  url={GET_FORM_URL}
                  open={showDialog}
                  onClose={handleClose}
                />
              </Row>
              <WatchDemoContainer>
                <LinkButton
                  iconPosition="left"
                  iconComponent={IcoCirclePlay24}
                  onClick={toggleDemo}
                >
                  {t('tertiary-button')}
                </LinkButton>
              </WatchDemoContainer>
            </ButtonsContainer>
          </Content>
          <ImagesContainer>
            <DynamicDesktopIllustration />
          </ImagesContainer>
        </Inner>
      </Container>
      <DemoVideo
        link={DEMO_LINK}
        onClose={toggleDemo}
        title="Footprint Demo"
        open={isDemoVisible}
      />
    </HeroContainer>
  );
};

const HeroContainer = styled.div`
  background-size: cover;
  position: relative;
  width: 100%;
  height: 100%;

  & > * {
    will-change: opacity, transform;
  }
`;

const Inner = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[10]};
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    max-width: 860px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[8]};
    text-align: center;
    z-index: 2;
  `}
`;

const ImagesContainer = styled.div`
  position: relative;
  width: 100%;
  z-index: 2;
`;

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: ${theme.spacing[6]};
    margin-top: ${theme.spacing[5]};
  `}
`;

const NoiseLayer = styled.div`
  position: absolute;
  background-image: url('/home/hero/noise.png');
  background-blend-mode: overlay;
  opacity: 0.1;
  width: 100%;
  height: 100%;
  background-size: cover;
  top: 0;
  left: 0;
  -webkit-mask-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(rgba(0, 0, 0, 1)),
    to(rgba(0, 0, 0, 0))
  );
`;

const ResponsiveHide = styled.span`
  &[data-viewport='mobile'] {
    display: block;

    ${media.greaterThan('sm')`
        display: none;
      `}
  }

  &[data-viewport='tablet-desktop'] {
    display: none;

    ${media.greaterThan('sm')`
        display: block;
      `}
  }
`;

const Row = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: ${theme.spacing[4]};
  `}
`;

const WatchDemoContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: ${theme.spacing[4]};
    margin-top: ${theme.spacing[4]};
  `}
`;

export default Hero;
