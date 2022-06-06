import { Events } from '@src/utils/state-machine/liveness-register';
import React from 'react';
import HeaderTitle from 'src/components/header-title';
import styled, { css } from 'styled';
import { Button, Divider, Typography } from 'ui';

import useLivenessRegisterMachine from '../../hooks/use-liveness-register';

const QRRegister = () => {
  const [, send] = useLivenessRegisterMachine();
  const handleSendLinkToPhone = () => {
    // TODO: implement
    send({ type: Events.qrRegisterSucceeded });
  };

  return (
    <Container>
      <HeaderTitle
        title="Liveness check"
        subtitle="We need to verify that you're a real person, but unfortunately your device doesn't support biometric authentication. Please fill out a captcha to continue."
      />
      <Typography variant="body-2" color="secondary">
        Use your camera app or QR code reader on your mobile device and
        we&apos;ll use biometrics to verify it.
      </Typography>
      {/* TODO: QR CODE HERE */}
      <Typography variant="body-4" color="secondary">
        Make sure the QR code is clearly visible on your device&apos;s screen.
        When authenticated, this page automatically updates.
      </Typography>
      <Divider />
      <Typography variant="body-2" color="secondary">
        Alternatively, we can send you a link to your phone and you can continue
        from there.
      </Typography>
      <Button onClick={handleSendLinkToPhone} fullWidth>
        Send a link to phone
      </Button>
    </Container>
  );
};

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
    text-align: center;
  `}
`;

export default QRRegister;
