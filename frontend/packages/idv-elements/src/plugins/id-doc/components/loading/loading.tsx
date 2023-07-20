import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import { IdDocImageTypes, IdDocType } from '@onefootprint/types';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';

import { imageIcons } from '../../constants/image-types';
import FeedbackIcon from '../feedback-icon';

export type LoadingProps = {
  imageType: IdDocImageTypes;
  docType: IdDocType;
};

const Loading = ({ imageType, docType }: LoadingProps) => {
  const { t } = useTranslation('components.loading');

  const side =
    imageType === (docType === IdDocType.passport && IdDocImageTypes.front)
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
