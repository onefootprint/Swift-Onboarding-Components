import { IdDocImageError } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import { ImageTypes } from '../../constants/image-types';
import Error from '../error';
import FadeInContainer from '../fade-in-container';
import IdDocPhotoButtons from '../id-doc-photo-buttons';

type IdDocPhotoRetryPromptProps = {
  imageType: ImageTypes.front | ImageTypes.back;
  errors: IdDocImageError[];
  onComplete: (image: string) => void;
};

const IdDocPhotoRetryPrompt = ({
  imageType,
  errors,
  onComplete,
}: IdDocPhotoRetryPromptProps) => (
  <FadeInContainer>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <Error imageType={imageType} errors={errors} />
      <IdDocPhotoButtons onComplete={onComplete} />
    </Box>
  </FadeInContainer>
);
export default IdDocPhotoRetryPrompt;
