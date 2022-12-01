import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React, { useRef } from 'react';
import styled, { css } from 'styled-components';

import ScanGuidelines from '../scan-guidelines';

type PromptProps = {
  showGuidelines?: boolean;
  onDone: (image: File) => void;
};

const Prompt = ({ showGuidelines, onDone }: PromptProps) => {
  const { t } = useTranslation('components.take-or-upload-photo');
  const takePhotoRef = useRef<HTMLInputElement | undefined>();
  const uploadPhotoRef = useRef<HTMLInputElement | undefined>();

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files?.length) {
      return;
    }
    onDone(files[0]);
  };

  const handleUpload = () => {
    uploadPhotoRef.current?.click();
  };

  const handleTake = () => {
    takePhotoRef.current?.click();
  };

  return (
    <>
      {showGuidelines && <ScanGuidelines />}
      <ButtonsContainer>
        <Button fullWidth onClick={handleTake}>
          {t('take-photo.title')}
        </Button>
        <StyledInput
          ref={takePhotoRef as React.RefObject<HTMLInputElement>}
          type="file"
          accept="image/*,.heic,.heif"
          capture="environment"
          onChange={handleImage}
        />

        <Button fullWidth variant="secondary" onClick={handleUpload}>
          {t('upload-photo.title')}
        </Button>
        <StyledInput
          ref={uploadPhotoRef as React.RefObject<HTMLInputElement>}
          type="file"
          accept="image/*,.heic,.heif"
          onChange={handleImage}
        />
      </ButtonsContainer>
    </>
  );
};

const StyledInput = styled.input`
  display: none;
`;

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[4]};
  `}
`;

export default Prompt;
