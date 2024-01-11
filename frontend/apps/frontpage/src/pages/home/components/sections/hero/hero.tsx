import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { IcoCirclePlay24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  Button,
  Container,
  createFontStyles,
  LinkButton,
  media,
} from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import ContactDialog from 'src/components/contact-dialog';
import LinkingButton from 'src/components/linking-button';

import DemoVideoReact from '../../demo-video';
import DesktopIllustration from './components/desktop-illustration';
import MobileIllustration from './components/mobile-illustration';
import TabletIllustration from './components/tablet-illustration';

const DEMO_LINK = 'https://www.youtube.com/embed/DZxY87-nD9A?autoplay=1';
const GET_FORM_URL =
  'https://getform.io/f/9f26eb67-51b3-4685-8dc4-8cf458e698e1';

const Hero = () => {
  const { t } = useTranslation('pages.home.hero');
  const [isDemoVisible, setDemoVisible] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const textAnimationVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const textItemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  };

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
    <GradientsContainer>
      <Blob color="rgba(209, 182, 114, 0.1)" left="55%" top="50%" blur={120} />
      <Blob color="rgba(114, 209, 169, 0.08)" left="10%" top="60%" blur={100} />
      <Blob color="rgba(75, 38, 218, 0.05)" left="60%" top="20%" blur={100} />
      <Container as="section" id="hero">
        <TextContainer
          variants={textAnimationVariants}
          initial="hidden"
          animate="show"
        >
          <Title variants={textItemVariants}>{t('title')}</Title>
          <Subtitle variants={textItemVariants}>{t('subtitle')}</Subtitle>
        </TextContainer>
        <ButtonsContainer
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut', delay: 0.6 }}
        >
          <Row>
            <LinkingButton href={`${DASHBOARD_BASE_URL}/sign-up`} size="large">
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
      </Container>
      <DemoVideoReact
        link={DEMO_LINK}
        open={isDemoVisible}
        onClose={toggleDemo}
      />
      <DesktopIllustration />
      <TabletIllustration />
      <MobileIllustration />
    </GradientsContainer>
  );
};

const Blob = styled.span<{
  color?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  blur?: number;
}>`
  ${({ theme, color, top, left, right, bottom }) => css`
    position: absolute;
    top: ${top || '0'};
    left: ${left || '0'};
    right: ${right || '0'};
    bottom: ${bottom || '0'};
    width: 532px;
    height: 370px;
    background: radial-gradient(
      50% 50% at 50% 50%,
      ${color || theme.color.primary} 0%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 50%;
    z-index: 2;
    pointer-events: none;
  `}
`;

const GradientsContainer = styled.div`
  ${({ theme }) => css`
    overflow: hidden;
    position: relative;
    overflow: hidden;
    background-color: ${theme.backgroundColor.primary};

    ${media.greaterThan('md')`
      background: linear-gradient(180deg, #ffffff 0%, #f7f7f7 100%);
    `}
  `}
`;

const TextContainer = styled(motion.div)`
  ${({ theme }) => css`
    max-width: 1092px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[5]};
    margin-bottom: ${theme.spacing[9]};
    text-align: center;
  `}
`;

const Title = styled(motion.h1)`
  ${({ theme }) => css`
    ${createFontStyles('display-2')}
    color: ${theme.color.primary};

    ${media.greaterThan('md')`
      ${createFontStyles('display-1')}
    `}
  `}
`;

const Subtitle = styled(motion.h2)`
  ${({ theme }) => css`
    ${createFontStyles('display-4')}
    color: ${theme.color.primary};
    max-width: 800px;
  `}
`;

const ButtonsContainer = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: ${theme.spacing[6]};
    margin-bottom: ${theme.spacing[10]};
  `}
`;

const Row = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: ${theme.spacing[4]};

    ${media.greaterThan('sm')`
       flex-direction: row;
    `}
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
