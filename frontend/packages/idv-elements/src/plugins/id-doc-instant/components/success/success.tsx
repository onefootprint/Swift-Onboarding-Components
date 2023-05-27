import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck16 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';
import { useTimeout } from 'usehooks-ts';

import { imageIcons, ImageTypes } from '../../constants/image-icons';
import TRANSITION_DELAY from '../../constants/transition-delay.constants';
import FeedbackIcon from '../feedback-icon';

type SuccessProps = {
  imageType: ImageTypes;
  onComplete: () => void;
};

const Success = ({ imageType, onComplete }: SuccessProps) => {
  const { t } = useTranslation('components.success');

  useTimeout(() => {
    onComplete();
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
