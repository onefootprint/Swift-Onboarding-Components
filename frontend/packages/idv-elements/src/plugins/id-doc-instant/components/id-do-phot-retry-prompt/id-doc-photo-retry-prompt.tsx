import { IdDocImageError } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import { ImageTypes } from '../../constants/image-icons';
import Error from '../error';
import IdDocPhotoButtons from '../id-doc-photo-buttons';

type IdDocPhotoRetryPromptProps = {
  imageType: ImageTypes;
  error?: IdDocImageError;
  onComplete: (image: string) => void;
};

const IdDocPhotoRetryPrompt = ({
  imageType,
  error,
  onComplete,
}: IdDocPhotoRetryPromptProps) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
    <Error imageType={imageType} error={error} />
    <IdDocPhotoButtons onComplete={onComplete} />
  </Box>
);
export default IdDocPhotoRetryPrompt;
