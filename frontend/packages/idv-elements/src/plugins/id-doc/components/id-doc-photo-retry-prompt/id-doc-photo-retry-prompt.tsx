import type { IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';
import React from 'react';
import styled, { css } from 'styled-components';

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
  onComplete: (imageFile: File) => void;
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
      <NavigationHeader
        button={{ variant: 'back', onBack: handleClickBack }}
        position="floating"
      />
      <PromptContainer>
        <Error
          imageType={imageType}
          errors={errors}
          docType={docType}
          countryName={countryName}
        />
        <IdDocPhotoButtons onComplete={onComplete} />
      </PromptContainer>
    </FadeInContainer>
  );
};

const PromptContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    align-items: center;
    justify-content: center;
    height: 100%;
  `}
`;
export default IdDocPhotoRetryPrompt;
