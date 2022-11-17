import {
  NavigationHeader,
  useFootprintProvider,
} from '@onefootprint/footprint-elements';
import { MY1FP_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle40 } from '@onefootprint/icons';
import { Box, LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';
import Confetti from 'react-confetti';
import useConfettiState from 'src/hooks/use-confetti-state';
import styled from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import useBifrostMachine from '../../hooks/use-bifrost-machine/use-bifrost-machine';

const CLOSE_DELAY = 6000;

const Success = () => {
  const { t } = useTranslation('pages.success');
  const footprint = useFootprintProvider();
  const [state] = useBifrostMachine();
  const { validationToken, userFound } = state.context;
  const { running, width, height } = useConfettiState();

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
          {userFound ? t('existing-user.title') : t('new-user.title')}
        </Typography>
        {userFound ? (
          <>
            <Typography
              variant="body-2"
              sx={{ marginBottom: 7 }}
              color="secondary"
            >
              {t('existing-user.description')}
            </Typography>
            <LinkButton
              onClick={() => {
                handleClose();
              }}
            >
              {t('existing-user.cta')}
            </LinkButton>
          </>
        ) : (
          <>
            <Typography
              variant="body-2"
              sx={{ marginBottom: 7 }}
              color="secondary"
            >
              {t('new-user.body.view-on-my-footprint')}&nbsp;
              <LinkButton href={MY1FP_URL} target="_blank">
                my.onefootprint.com
              </LinkButton>
            </Typography>
            <Typography variant="body-2" color="secondary">
              {t('new-user.body.one-click')}
            </Typography>
          </>
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
`;

export default Success;
