import { useFootprintJs } from 'footprint-provider';
import { useTranslation } from 'hooks';
import IcoCheckCircle40 from 'icons/ico/ico-check-circle-40';
import React, { useEffect } from 'react';
import NavigationHeader from 'src/components/navigation-header';
import styled from 'styled-components';
import { Box, LinkButton, Typography } from 'ui';

import useBifrostMachine from '../../hooks/use-bifrost-machine/use-bifrost-machine';

const CLOSE_DELAY = 1000;

const VerificationSuccess = () => {
  const { t } = useTranslation('pages.verification-success');
  const footprint = useFootprintJs();
  const [state] = useBifrostMachine();

  useEffect(() => {
    const { validationToken } = state.context.onboarding;
    if (!validationToken) {
      return;
    }
    setTimeout(() => {
      footprint.complete(validationToken);
      footprint.close();
    }, CLOSE_DELAY);
  }, []);

  const handleClose = () => {
    footprint.close();
  };

  return (
    <>
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
