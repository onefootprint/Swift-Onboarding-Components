import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle40 } from '@onefootprint/icons';
import { Box } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import HeaderTitle from '../../../../components/header-title';
import NavigationHeader from '../../../../components/navigation-header';
import { useOnboardingMachine } from '../../components/machine-provider';
import { isKybCdo } from '../../utils/cdo-utils';
import ConfettiAnimation from './confetti/confetti';

const CLOSE_DELAY = 6000;

const Authorized = () => {
  const { t } = useTranslation('pages.complete');
  const [state] = useOnboardingMachine();
  // TODO: belce
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { validationToken, config } = state.context;
  // const {
  //   callbacks: { onComplete, onClose },
  //   layout: { canClose },
  // } = useAppContext();
  const [showConfetti, setShowConfetti] = useState(true);
  const hasKyb = config?.canAccessData?.some(cdo => isKybCdo(cdo));

  useEffectOnce(() => {
    handleComplete(CLOSE_DELAY);
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleComplete = (closeDelay?: number) => {
    // TODO: belce
    // if (validationToken) {
    //   onComplete(validationToken, closeDelay);
    // }
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
        <Box />
        {/* TODO: belce */}
        {/* {canClose && onClose && (
          <LinkButton sx={{ marginTop: 7 }} onClick={onClose}>
            {t('cta')}
          </LinkButton>
        )} */}
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

export default Authorized;
