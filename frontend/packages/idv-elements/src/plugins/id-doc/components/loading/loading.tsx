import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import { IdDocImageTypes } from '@onefootprint/types';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';

import { imageIcons } from '../../constants/image-types';
import FeedbackIcon from '../feedback-icon';

export type LoadingProps = {
  imageType: IdDocImageTypes;
  backgroundColor?: 'primary' | 'secondary';
};

const Loading = ({ imageType, backgroundColor = 'primary' }: LoadingProps) => {
  const { t } = useTranslation('components.loading');

  return (
    <Container>
      <FeedbackIcon
        imageIcon={{ component: imageIcons[imageType] }}
        statusIndicator={{
          component: <LoadingIndicator size="compact" color="warning" />,
          status: 'loading',
          backgroundColor,
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
