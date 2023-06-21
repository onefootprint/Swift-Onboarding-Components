import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle40 } from '@onefootprint/icons';
import {
  ConfettiAnimation,
  HeaderTitle,
  NavigationHeader,
} from '@onefootprint/idv-elements';
import { LAYOUT_CONTAINER_ID } from '@onefootprint/idv-elements/src/components/layout/constants';
import styled from '@onefootprint/styled';
import { Box, LinkButton, LoadingIndicator } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useEffectOnce, useTimeout } from 'usehooks-ts';

import useIdvMachine from '../../hooks/use-idv-machine';
import useIsKyb from './hooks/use-is-kyb';

const CLOSE_DELAY = 6000;
const CONFETTI_DELAY = 600;

const Complete = () => {
  const { t } = useTranslation('pages.complete');
  const [state] = useIdvMachine();
  const { isLoading, isKyb } = useIsKyb();
  const { validationToken, onClose, onComplete, hideConfetti } = state.context;
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiDimensions, setConfettiDimensions] = useState({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });

  useTimeout(() => {
    const container = document.getElementById(LAYOUT_CONTAINER_ID);
    if (container) {
      container.getBoundingClientRect();
      setConfettiDimensions({
        width: container.offsetWidth,
        height: container.offsetHeight,
        left: container.offsetLeft,
        top: container.offsetTop,
      });
      if (!hideConfetti) setShowConfetti(true);
    }
  }, CONFETTI_DELAY);

  useEffectOnce(() => {
    if (validationToken) {
      onComplete?.(validationToken, CLOSE_DELAY);
    }
  });

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const handleCompleteAnimation = () => {
    setShowConfetti(false);
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'close' }} />
      <Container>
        <IcoCheckCircle40 color="success" />
        <Box sx={{ marginBottom: 4 }} />
        <HeaderTitle
          sx={{ display: 'flex', flexDirection: 'column', gap: 4, zIndex: 3 }}
          title={t('title')}
          subtitle={isKyb ? t('subtitle-with-kyb') : t('subtitle')}
        />
        <Box />
        {onClose && (
          <LinkButton sx={{ marginTop: 7 }} onClick={onClose}>
            {t('cta')}
          </LinkButton>
        )}
        {showConfetti && (
          <ConfettiAnimation
            onComplete={handleCompleteAnimation}
            height={confettiDimensions.height}
            width={confettiDimensions.width}
            left={confettiDimensions.left}
            top={confettiDimensions.top}
          />
        )}
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
