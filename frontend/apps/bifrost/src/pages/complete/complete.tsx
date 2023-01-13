import {
  HeaderTitle,
  NavigationHeader,
  useFootprintProvider,
} from '@onefootprint/footprint-elements';
import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle40 } from '@onefootprint/icons';
import { OnboardingStatus } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';
import Confetti from 'react-confetti';
import useConfettiState from 'src/hooks/use-confetti-state';
import styled from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import useBifrostMachine from '../../hooks/use-bifrost-machine/use-bifrost-machine';

const CLOSE_DELAY = 6000;

const Complete = () => {
  const { t } = useTranslation('pages.complete');
  const footprint = useFootprintProvider();
  const [state] = useBifrostMachine();
  const { validationToken, status } = state.context;
  const { running, width, height } = useConfettiState();
  const isVerified = status === OnboardingStatus.verified;

  useEffectOnce(() => {
    handleClose(CLOSE_DELAY);
  });

  const handleClose = (closeDelay?: number) => {
    if (validationToken) {
      footprint.complete({
        validationToken,
        closeDelay,
      });
    }
  };

  return (
    <>
      {isVerified && (
        <Confetti
          height={height}
          numberOfPieces={50}
          recycle={running}
          width={width}
        />
      )}
      <NavigationHeader
        button={{
          variant: 'close',
        }}
      />
      <Container>
        <Box sx={{ marginBottom: 8 }}>
          <IcoCheckCircle40 color="success" />
        </Box>
        <HeaderTitle
          title={isVerified ? t('success.title') : t('failure.title')}
          subtitle={isVerified ? t('success.subtitle') : t('failure.subtitle')}
        />
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

export default Complete;
