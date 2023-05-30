import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck16 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import { imageIcons, ImageTypes } from '../../constants/image-icons';
import FeedbackIcon from '../feedback-icon';

type SuccessProps = {
  imageType: ImageTypes;
};

const Success = ({ imageType }: SuccessProps) => {
  const { t } = useTranslation('components.success');

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
