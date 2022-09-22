import { NavigationHeader, useFootprintJs } from 'footprint-elements';
import { useTranslation } from 'hooks';
import { IcoCheckCircle40 } from 'icons';
import React, { useEffect } from 'react';
import Confetti from 'react-confetti';
import styled from 'styled-components';
import { Box, LinkButton, Typography } from 'ui';

import useBifrostMachine from '../../hooks/use-bifrost-machine/use-bifrost-machine';
import useConfettiState from '../../hooks/use-confetti-state';

const CLOSE_DELAY = 6000;

const VerificationSuccess = () => {
  const { t } = useTranslation('pages.verification-success');
  const footprint = useFootprintJs();
  const [state] = useBifrostMachine();
  const { running, width, height } = useConfettiState();

  useEffect(() => {
    const { validationToken } = state.context.onboarding;
    if (!validationToken) {
      return () => {};
    }
    footprint.complete(validationToken);
    const timer = setTimeout(() => {
      footprint.close();
    }, CLOSE_DELAY);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
