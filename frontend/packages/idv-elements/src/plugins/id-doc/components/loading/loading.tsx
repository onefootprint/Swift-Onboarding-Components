import { useTranslation } from '@onefootprint/hooks';
import { IdDocType } from '@onefootprint/types';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import { imageIcons, ImageTypes } from '../../constants/image-types';
import FeedbackIcon from '../feedback-icon';

export type LoadingProps = {
  imageType: ImageTypes;
  docType: IdDocType;
};

const Loading = ({ imageType, docType }: LoadingProps) => {
  const { t } = useTranslation('components.loading');

  const side =
    imageType === (docType === IdDocType.passport && ImageTypes.front)
      ? 'one-side'
      : imageType;

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
        {t(`processing-${side}`)}
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
