import { useFootprintJs } from 'footprint-provider';
import { useTranslation } from 'hooks';
import IcoCheckCircle40 from 'icons/ico/ico-check-circle-40';
import React from 'react';
import Confetti from 'react-confetti';
import NavigationHeader from 'src/components/navigation-header';
import useConfettiState from 'src/hooks/use-confetti-state';
import styled from 'styled-components';
import { Box, LinkButton, Typography } from 'ui';

const VerificationSuccess = () => {
  const { t } = useTranslation('pages.verification-success');
  const footprint = useFootprintJs();
  const { height, width, running } = useConfettiState();

  const handleClose = () => {
    footprint.close();
  };

  return (
    <>
      <Confetti
        height={height}
        numberOfPieces={50}
        recycle={running}
        width={width}
      />
      <NavigationHeader button={{ variant: 'close' }} />
      <Container>
        <Box sx={{ marginBottom: 3 }}>
          <IcoCheckCircle40 color="success" />
        </Box>
        <Typography variant="heading-3" sx={{ marginBottom: 7 }}>
          {t('title')}
        </Typography>
        <Typography variant="body-2" sx={{ marginBottom: 7 }} color="secondary">
          {t('description')}
        </Typography>
        <LinkButton onClick={handleClose}>{t('cta')}</LinkButton>
      </Container>
    </>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
`;

export default VerificationSuccess;
