import { MY1FP_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle40 } from '@onefootprint/icons';
import { Box, LinkButton, Typography } from '@onefootprint/ui';
import { NavigationHeader, useFootprintJs } from 'footprint-elements';
import React, { useEffect } from 'react';
import Confetti from 'react-confetti';
import useConfettiState from 'src/hooks/use-confetti-state';
import styled from 'styled-components';

import useBifrostMachine from '../../hooks/use-bifrost-machine/use-bifrost-machine';

const CLOSE_DELAY = 6000;

const OnboardingSuccess = () => {
  const { t } = useTranslation('pages.onboarding-success');
  const { running, width, height } = useConfettiState();
  const footprint = useFootprintJs();
  const [state] = useBifrostMachine();

  useEffect(() => {
    const { validationToken } = state.context;
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

  return (
    <>
      <Confetti
        height={height}
        numberOfPieces={50}
        recycle={running}
        width={width}
      />
      <NavigationHeader
        button={{
          variant: 'close',
        }}
      />
      <Container>
        <Box sx={{ marginBottom: 3 }}>
          <IcoCheckCircle40 color="success" />
        </Box>
        <Typography variant="heading-3" sx={{ marginBottom: 7 }}>
          {t('title')}
        </Typography>
        <Typography variant="body-2" sx={{ marginBottom: 7 }} color="secondary">
          {t('body.view-on-my-footprint')}&nbsp;
          <LinkButton href={MY1FP_URL} target="_blank">
            my.onefootprint.com
          </LinkButton>
        </Typography>
        <Typography variant="body-2" color="secondary">
          {t('body.one-click')}
        </Typography>
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

export default OnboardingSuccess;
