import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button } from '@onefootprint/ui';
import React, { useRef, useState } from 'react';

import useProcessImage from '../../hooks/use-process-image';
import { useIdDocMachine } from '../machine-provider';

type IdDocPhotoButtonsProp = {
  onComplete: (imageString: string, mimeType: string) => void;
};

const IdDocPhotoButtons = ({ onComplete }: IdDocPhotoButtonsProp) => {
  const { t } = useTranslation('components.id-doc-photo-upload-buttons');
  const [, send] = useIdDocMachine();
  const uploadPhotoRef = useRef<HTMLInputElement | undefined>();
  const { processImageFile, convertImageFileToStrippedBase64 } =
    useProcessImage();

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
      return;
    }

    const processingResult = await processImageFile(files[0]);
    if (!processingResult) {
      onProcessingDone();
      return;
    }

    const { processedImageFile, mimeType } = processingResult;

    const imageString = await convertImageFileToStrippedBase64(
      processedImageFile,
    );
    if (!imageString) {
      onProcessingDone();
      return;
    }

    onComplete(imageString, mimeType);
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
