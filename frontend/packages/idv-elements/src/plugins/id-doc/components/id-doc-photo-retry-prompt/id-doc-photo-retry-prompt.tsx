import type { IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import { NavigationHeader } from '../../../../components';
import type { IdDocImageErrorType } from '../../utils/state-machine';
import Error from '../error';
import FadeInContainer from '../fade-in-container';
import IdDocPhotoButtons from '../id-doc-photo-buttons';
import { useIdDocMachine } from '../machine-provider';

type IdDocPhotoRetryPromptProps = {
  docType: SupportedIdDocTypes;
  countryName: string;
  imageType: IdDocImageTypes.front | IdDocImageTypes.back;
  errors: IdDocImageErrorType[];
  onComplete: (imageString: string, mimeType: string) => void;
};

const IdDocPhotoRetryPrompt = ({
  docType,
  countryName,
  imageType,
  errors,
  onComplete,
}: IdDocPhotoRetryPromptProps) => {
  const [, send] = useIdDocMachine();

  const handleClickBack = () => {
    send({
      type: 'navigatedToCountryDoc',
    });
  };

  return (
    <FadeInContainer>
      <NavigationHeader button={{ variant: 'back', onBack: handleClickBack }} />
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
};
export default IdDocPhotoRetryPrompt;
