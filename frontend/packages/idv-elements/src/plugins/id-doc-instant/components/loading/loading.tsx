import { useTranslation } from '@onefootprint/hooks';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import { imageIcons, ImageTypes } from '../../constants/image-icons';
import FeedbackIcon from '../feedback-icon';

export type LoadingProps = {
  imageType: ImageTypes;
};

const Loading = ({ imageType }: LoadingProps) => {
  const { t } = useTranslation('components.loading');

  return (
    <Container>
      <FeedbackIcon
        imageIcon={{ component: imageIcons[imageType] }}
        statusIndicator={{
          component: <LoadingIndicator size="compact" color="warning" />,
          status: 'loading',
        }}
      />
      <Typography variant="label-1" sx={{ marginTop: 5, textAlign: 'center' }}>
        {t(`processing-${imageType}`)}
      </Typography>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default Loading;
