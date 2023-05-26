import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck16 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';
import { useTimeout } from 'usehooks-ts';

import { imageIcons, ImageTypes } from '../../constants/image-icons';
import TRANSITION_DELAY from '../../constants/transition-delay.constants';
import { MachineEvents } from '../../utils/state-machine';
import FeedbackIcon from '../feedback-icon/feedback-icon';
import { useIdDocMachine } from '../machine-provider';

type SuccessProps = {
  imageType: ImageTypes;
  event: MachineEvents;
};

const Success = ({ imageType, event }: SuccessProps) => {
  const { t } = useTranslation('components.success');
  const [, send] = useIdDocMachine();

  useTimeout(() => {
    send(event);
  }, TRANSITION_DELAY);

  return (
    <Container>
      <FeedbackIcon
        imageIcon={{ component: imageIcons[imageType] }}
        statusIndicator={{
          component: <IcoCheck16 color="success" />,
          status: 'success',
        }}
      />
      <Typography variant="label-1" sx={{ textAlign: 'center', marginTop: 5 }}>
        {t(`${imageType}-upload`)}
      </Typography>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default Success;
