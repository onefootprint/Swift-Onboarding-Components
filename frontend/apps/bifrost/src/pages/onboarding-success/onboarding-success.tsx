import { MY1FP_URL } from 'global-constants';
import { useTranslation } from 'hooks';
import IcoCheckCircle40 from 'icons/ico/ico-check-circle-40';
import React from 'react';
import Confetti from 'react-confetti';
import NavigationHeader from 'src/components/navigation-header';
import useConfettiState from 'src/hooks/use-confetti-state';
import styled from 'styled-components';
import { Box, LinkButton, Typography } from 'ui';

const OnboardingSuccess = () => {
  const { t } = useTranslation('pages.onboarding-success');
  const { running, width, height } = useConfettiState();

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
