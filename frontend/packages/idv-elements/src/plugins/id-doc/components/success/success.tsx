import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck16 } from '@onefootprint/icons';
import styled from '@onefootprint/styled';
import { IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React, { useEffect } from 'react';

import { imageIcons } from '../../constants/image-types';
import { TRANSITION_DELAY_DEFAULT } from '../../constants/transition-delay.constants';
import FeedbackIcon from '../feedback-icon';

type SuccessProps = {
  imageType: IdDocImageTypes;
  docType: SupportedIdDocTypes;
  backgroundColor?: 'primary' | 'secondary';
  onComplete?: () => void;
};

const Success = ({
  imageType,
  onComplete,
  docType,
  backgroundColor = 'primary',
}: SuccessProps) => {
  const { t } = useTranslation('components.success');

  useEffect(() => {
    // This conditional should satisfy only when we are done with the flow
    if (onComplete) {
      setTimeout(onComplete, TRANSITION_DELAY_DEFAULT);
    }
  }, [onComplete]);

  const side =
    imageType ===
    (docType === SupportedIdDocTypes.passport && IdDocImageTypes.front)
      ? 'one-side'
      : imageType;

  return (
    <Container>
      <FeedbackIcon
        imageIcon={{ component: imageIcons[imageType] }}
        statusIndicator={{
          component: <IcoCheck16 color="success" />,
          status: 'success',
          backgroundColor,
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
