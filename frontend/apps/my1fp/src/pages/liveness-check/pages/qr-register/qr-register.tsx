import { HeaderTitle } from 'footprint-ui';
import { useTranslation } from 'hooks';
import React from 'react';
import styled, { css } from 'styled-components';
import { Button, Divider, Typography } from 'ui';

const QRLivenessCheck = () => {
  const { t } = useTranslation('pages.liveness-check.qr-register');

  const handleSendLinkToPhone = () => {
    // TODO: implement sending link to phone
    // https://linear.app/footprint/issue/FP-497/biometric-verification
  };

  return (
    <Container>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <Typography variant="body-2" color="secondary">
        {t('instructions')}
      </Typography>
      {/* TODO: implement QR Code */}
      <Typography variant="body-4" color="tertiary">
        {t('qr-code.instructions')}
      </Typography>
      <Divider />
      <Typography variant="body-2" color="secondary">
        {t('sms.instructions')}
      </Typography>
      <Button fullWidth onClick={handleSendLinkToPhone}>
        {t('sms.cta')}
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

export default QRLivenessCheck;
