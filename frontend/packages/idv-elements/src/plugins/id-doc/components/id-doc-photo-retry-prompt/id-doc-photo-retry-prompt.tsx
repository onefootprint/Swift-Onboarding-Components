import {
  IdDocImageProcessingError,
  IdDocImageTypes,
  IdDocImageUploadError,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import Error from '../error';
import FadeInContainer from '../fade-in-container';
import IdDocPhotoButtons from '../id-doc-photo-buttons';

type IdDocPhotoRetryPromptProps = {
  docType: SupportedIdDocTypes;
  countryName: string;
  imageType: IdDocImageTypes.front | IdDocImageTypes.back;
  errors: (IdDocImageProcessingError | IdDocImageUploadError)[];
  onComplete: (imageString: string, mimeType: string) => void;
};

const IdDocPhotoRetryPrompt = ({
  docType,
  countryName,
  imageType,
  errors,
  onComplete,
}: IdDocPhotoRetryPromptProps) => (
  <FadeInContainer>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <Error
        imageType={imageType}
        errors={errors}
        docType={docType}
        countryName={countryName}
      />
      <IdDocPhotoButtons onComplete={onComplete} />
    </Box>
  </FadeInContainer>
);
export default IdDocPhotoRetryPrompt;
