import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck16 } from '@onefootprint/icons';
import { IdDocType } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import styled from 'styled-components';

import { imageIcons, ImageTypes } from '../../constants/image-types';
import TRANSITION_DELAY from '../../constants/transition-delay.constants';
import FeedbackIcon from '../feedback-icon';

type SuccessProps = {
  imageType: ImageTypes;
  docType: IdDocType;
  onComplete?: () => void;
};

const Success = ({ imageType, onComplete, docType }: SuccessProps) => {
  const { t } = useTranslation('components.success');

  useEffect(() => {
    // This conditional should satisfy only when we are done with the flow
    if (onComplete) {
      setTimeout(onComplete, TRANSITION_DELAY);
    }
  }, [onComplete]);

  const side =
    imageType === (docType === IdDocType.passport && ImageTypes.front)
      ? 'one-side'
      : imageType;

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
        {t(`${side}-upload`)}
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
