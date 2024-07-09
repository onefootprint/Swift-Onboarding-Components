import { Button, Stack, Text, media } from '@onefootprint/ui';
import React, { useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import { sendGTMEvent } from '@next/third-parties/google';
import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { TrackingEventType } from 'src/@types/tracking';
import ContactDialog from 'src/components/contact-dialog';
import Illustration from './components/illustration';

type CustomBannerProps = {
  title: string;
  subtitle: string;
  primaryButton?: string;
  secondaryButton?: string;
  onClickPrimaryButton?: () => void;
  onClickSecondaryButton?: () => void;
};

const GET_FORM_URL = 'https://getform.io/f/pbygomeb';
const SIGN_UP_URL = `${DASHBOARD_BASE_URL}/authentication/sign-up`;

const sendTrackingEvent = (type: TrackingEventType) => {
  sendGTMEvent({ event: 'buttonClicked', value: type });
};

const CustomBanner = ({
  title,
  subtitle,
  primaryButton = 'Get Started',
  secondaryButton = 'Learn More',
}: CustomBannerProps) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleSignUpClick = () => {
    window.open(SIGN_UP_URL, '_blank');
    sendTrackingEvent('sign-up');
  };

  const handleScheduleCall = () => {
    setShowDialog(true);
    sendTrackingEvent('book-a-call');
  };

  const handleClose = () => {
    setShowDialog(false);
  };

  return (
    <Container direction="column" align="center" gap={2} paddingTop={11} paddingBottom={12} width="100%">
      <Illustration />
      <Stack direction="column" align="center" textAlign="center" gap={8}>
        <Stack direction="column" align="center" textAlign="center" gap={3}>
          <Text variant="display-3" color="primary">
            {title}
          </Text>
          <Text variant="display-4" color="tertiary" maxWidth="600px">
            {subtitle}
          </Text>
        </Stack>
        <ResponsiveStack gap={4}>
          <Button variant="primary" onClick={handleScheduleCall} size="large">
            {primaryButton}
          </Button>
          <Button variant="secondary" onClick={handleSignUpClick} size="large">
            {secondaryButton}
          </Button>
        </ResponsiveStack>
      </Stack>
      <ContactDialog url={GET_FORM_URL} open={showDialog} onClose={handleClose} />
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      opacity: 0.5;
      position: absolute;
      width: 100%;
      height: 100%;
      transform: translate(-50%, -50%);
      top: 0;
      left: 50%;
      z-index: -1;
      border-radius: 100%;
      background: radial-gradient(
        100% 50% at 50% 50%,
        ${theme.backgroundColor.quaternary} 0%,
        ${theme.backgroundColor.primary} 50%
      );
      background-blend-mode: overlay;
    }
  `}
`;

const ResponsiveStack = styled(Stack)`
  flex-direction: column;
  width: 100%;

  ${media.greaterThan('sm')`
    flex-direction: row;
    width: auto;
  `}
`;

export default CustomBanner;
