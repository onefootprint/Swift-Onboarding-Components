import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle40 } from '@onefootprint/icons';
import {
  ConfettiAnimation,
  HeaderTitle,
  Layout,
  useLayoutOptions,
} from '@onefootprint/idv-elements';
import { Box } from '@onefootprint/ui';
import React, { useState } from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';
import useIsKyb from 'src/utils/is-kyb/is-kyb';
import styled from 'styled-components';

const Complete = () => {
  const { t } = useTranslation('pages.complete');
  const { layout } = useLayoutOptions();
  const isKyb = useIsKyb();
  const [showConfetti, setShowConfetti] = useState(true);
  const [state] = useHostedMachine();
  const { onboardingConfig } = state.context;

  const handleCompleteAnimation = () => {
    setShowConfetti(false);
  };

  return (
    <Layout tenantPk={onboardingConfig?.key} options={layout}>
      <Container>
        {showConfetti && (
          <ConfettiAnimation onComplete={handleCompleteAnimation} />
        )}
        <IcoCheckCircle40 color="success" />
        <Box sx={{ marginBottom: 4 }} />
        <HeaderTitle
          sx={{ display: 'flex', flexDirection: 'column', gap: 4, zIndex: 3 }}
          title={t('title')}
          subtitle={isKyb ? t('subtitle-with-kyb') : t('subtitle')}
        />
        <Box sx={{ marginBottom: 7 }} />
      </Container>
    </Layout>
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
