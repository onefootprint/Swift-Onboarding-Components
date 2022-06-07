import React from 'react';
import HeaderTitle from 'src/components/header-title';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

const QRLogin = () => (
  <Container>
    <HeaderTitle
      title="Biometric Authentication"
      subtitle="Use your camera app or QR code reader on your mobile device and we'll use biometrics to authenticate your access."
    />
    <Typography variant="body-2" color="secondary">
      Use your camera app or QR code reader on your mobile device and we&apos;ll
      use biometrics to verify it.
    </Typography>
    {/* TODO: QR CODE HERE */}
    <Typography variant="body-4" color="secondary">
      Make sure the QR code is clearly visible on your device&apos;s screen.
      When authenticated, this page automatically updates.
    </Typography>
  </Container>
);

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
    text-align: center;
  `}
`;

export default QRLogin;
