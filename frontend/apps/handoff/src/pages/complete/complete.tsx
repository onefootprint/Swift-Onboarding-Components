import { useCountdown } from '@onefootprint/hooks';
import { HeaderTitle, NavigationHeader, getBasicDevice, useUpdateD2PStatus } from '@onefootprint/idv';
import { D2PStatusUpdate } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import useHandoffMachine from '../../hooks/use-handoff-machine';

const SUCCESS_COUNTER_SECONDS = 3;

const Complete = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.complete' });
  const updateD2PStatusMutation = useUpdateD2PStatus();
  const [state] = useHandoffMachine();
  const { authToken, opener } = state.context;

  const device = getBasicDevice();
  const isMobile = device.type === 'mobile';
  const isOpenerMobile = opener === 'mobile';
  // Show a countdown if we just opened a new tab on the same device. If we handed off to a
  // different device, leave the window open
  const isHandoffOnSameDevice = isOpenerMobile === isMobile;
  const { countdown, setSeconds } = useCountdown({
    disabled: !isHandoffOnSameDevice,
    onCompleted: () => window.close(),
  });

  useEffectOnce(() => {
    if (authToken) {
      updateD2PStatusMutation.mutate({
        authToken,
        status: D2PStatusUpdate.completed,
      });
    }
    setSeconds(SUCCESS_COUNTER_SECONDS);
  });

  return (
    <Container>
      <Box>
        <NavigationHeader />
        <HeaderTitle
          title={t('title')}
          subtitle={
            isHandoffOnSameDevice
              ? t(countdown === 1 ? 'subtitle.with-countdown-singular' : 'subtitle.with-countdown', {
                  seconds: countdown,
                })
              : t('subtitle.without-countdown')
          }
        />
      </Box>
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  text-align: center;
`;

export default Complete;
