import {
  HeaderTitle,
  NavigationHeader,
  useFootprintProvider,
} from '@onefootprint/footprint-elements';
import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle40 } from '@onefootprint/icons';
import { Box, LinkButton } from '@onefootprint/ui';
import React, { useState } from 'react';
import isKybCdo from 'src/utils/cdo-utils/isKybCdo';
import styled from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import useBifrostMachine from '../../hooks/use-bifrost-machine/use-bifrost-machine';
import ConfettiAnimation from './confetti/confetti';

const CLOSE_DELAY = 6000;

const Complete = () => {
  const { t } = useTranslation('pages.complete');
  const footprint = useFootprintProvider();
  const [state] = useBifrostMachine();
  const { validationToken, config } = state.context;
  const [showConfetti, setShowConfetti] = useState(true);
  const hasKyb = config?.canAccessData?.some(cdo => isKybCdo(cdo));

  useEffectOnce(() => {
    handleComplete(CLOSE_DELAY);
  });

  const handleComplete = (closeDelay?: number) => {
    if (validationToken) {
      footprint.complete({
        validationToken,
        closeDelay,
      });
    }
  };

  const handleClose = () => {
    footprint.close();
  };

  const handleCompleteAnimation = () => {
    setShowConfetti(false);
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'close' }} />
      <Container>
        {showConfetti && (
          <ConfettiAnimation onComplete={handleCompleteAnimation} />
        )}
        <IcoCheckCircle40 color="success" />
        <Box sx={{ marginBottom: 4 }} />
        <HeaderTitle
          sx={{ display: 'flex', flexDirection: 'column', gap: 4, zIndex: 3 }}
          title={t('title')}
          subtitle={hasKyb ? t('subtitle-with-kyb') : t('subtitle')}
        />
        <Box sx={{ marginBottom: 7 }} />
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
  position: relative;
`;

export default Complete;
