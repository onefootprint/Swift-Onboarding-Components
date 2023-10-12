import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button } from '@onefootprint/ui';
import React, { useRef, useState } from 'react';

import Logger from '../../../../utils/logger';
import useProcessImage from '../../hooks/use-process-image';
import { useIdDocMachine } from '../machine-provider';

type IdDocPhotoButtonsProp = {
  onComplete: (imageFile: File, extraCompressed: boolean) => void;
};

const IdDocPhotoButtons = ({ onComplete }: IdDocPhotoButtonsProp) => {
  const { t } = useTranslation('components.id-doc-photo-upload-buttons');
  const [state, send] = useIdDocMachine();
  const { hasBadConnectivity } = state.context;
  const uploadPhotoRef = useRef<HTMLInputElement | undefined>();
  const { processImageFile } = useProcessImage();

  const [isLoading, setIsLoading] = useState(false);
  const [captureMethod, setCaptureMethod] = useState<
    'take' | 'upload' | undefined
  >();

  const onProcessingDone = () => {
    setIsLoading(false);
    setCaptureMethod(undefined);
  };

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const { files } = event.target;
    if (!files?.length) {
      onProcessingDone();
      console.error('Image upload failed. No image files detected');
      Logger.error(
        'Image upload failed. No image files detected',
        'id-doc-photo-buttons',
      );
      return;
    }

    const processResult = await processImageFile(files[0], hasBadConnectivity);
    if (!processResult) {
      console.error(
        'Image upload failed. Uploaded image could not be processed',
      );
      Logger.error(
        'Image upload failed. Uploaded image could not be processed',
        'id-doc-photo-buttons',
      );
      onProcessingDone();
      return;
    }
    const { file, extraCompressed } = processResult;

    onComplete(file, extraCompressed);
    onProcessingDone();
  };

  const handleUpload = () => {
    setCaptureMethod('upload');
    uploadPhotoRef.current?.click();
  };

  const handleTake = () => {
    send({ type: 'startImageCapture' });
  };

  return (
    <ButtonsContainer>
      <Button fullWidth onClick={handleTake}>
        {t('take-photo.title')}
      </Button>
      <Button
        fullWidth
        variant="secondary"
        onClick={handleUpload}
        loading={isLoading && captureMethod === 'upload'}
        disabled={isLoading}
      >
        {t('upload-photo.title')}
      </Button>
      <StyledInput
        ref={uploadPhotoRef as React.RefObject<HTMLInputElement>}
        type="file"
        accept="image/*,.heic,.heif"
        onChange={handleImage}
        aria-label="file-input"
      />
    </ButtonsContainer>
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

export default IdDocPhotoButtons;
