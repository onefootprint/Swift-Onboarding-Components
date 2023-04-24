import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle40 } from '@onefootprint/icons';
import { Box, LinkButton } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import { HeaderTitle, NavigationHeader } from '../../../../components';
import { useOnboardingMachine } from '../../components/machine-provider';
import { isKybCdo } from '../../utils/cdo-utils';
import ConfettiAnimation from './confetti/confetti';

const CLOSE_DELAY = 6000;

const Authorized = () => {
  const { t } = useTranslation('pages.complete');
  const [state] = useOnboardingMachine();
  const { validationToken, config, onClose, onComplete } = state.context;
  const [showConfetti, setShowConfetti] = useState(true);
  const hasKyb = config?.canAccessData?.some(cdo => isKybCdo(cdo));

  useEffectOnce(() => {
    if (validationToken) {
      onComplete?.(validationToken, CLOSE_DELAY);
    }
  });

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
        {onClose && (
          <LinkButton sx={{ marginTop: 7 }} onClick={onClose}>
            {t('cta')}
          </LinkButton>
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

export default Authorized;
