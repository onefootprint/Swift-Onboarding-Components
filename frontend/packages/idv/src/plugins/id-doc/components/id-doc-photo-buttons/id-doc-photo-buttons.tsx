import { Button } from '@onefootprint/ui';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Logger from '../../../../utils/logger';
import useProcessImage from '../../hooks/use-process-image';
import type { CaptureKind } from '../../utils/state-machine';
import { useIdDocMachine } from '../machine-provider';

type IdDocPhotoButtonsProp = {
  onComplete: (
    imageFile: File | Blob,
    extraCompressed: boolean,
    captureKind: CaptureKind,
  ) => void;
  uploadFirst?: boolean;
};

const IdDocPhotoButtons = ({
  onComplete,
  uploadFirst,
}: IdDocPhotoButtonsProp) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'id-doc.components.id-doc-photo-upload-buttons',
  });
  const [state, send] = useIdDocMachine();
  const { hasBadConnectivity } = state.context;
  const uploadPhotoRef = useRef<HTMLInputElement | undefined>();
  const { processImageFile, acceptedFileFormats } = useProcessImage({
    allowPdf: uploadFirst,
  });

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
      Logger.error(
        'Image upload failed. No image files detected',
        'id-doc-photo-buttons',
      );
      return;
    }

    const processResult = await processImageFile(files[0], hasBadConnectivity);
    if (!processResult) {
      Logger.error(
        'Image upload failed. Uploaded image could not be processed',
        'id-doc-photo-buttons',
      );
      onProcessingDone();
      return;
    }
    const { file, extraCompressed } = processResult;

    Logger.info(
      `IdDocPhotoButtons: size of the processed file to be sent in machine event type 'receivedImage' is ${file.size}, file type ${file.type}`,
    );

    onComplete(file, extraCompressed, 'upload');
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
      {!!uploadFirst && (
        <Button
          fullWidth
          variant="primary"
          onClick={handleUpload}
          loading={isLoading && captureMethod === 'upload'}
          disabled={isLoading}
        >
          {t('upload-file.title')}
        </Button>
      )}
      <Button
        fullWidth
        onClick={handleTake}
        variant={uploadFirst ? 'secondary' : 'primary'}
      >
        {t('take-photo.title')}
      </Button>
      {!uploadFirst && (
        <Button
          fullWidth
          variant="secondary"
          onClick={handleUpload}
          loading={isLoading && captureMethod === 'upload'}
          disabled={isLoading}
        >
          {t('upload-photo.title')}
        </Button>
      )}
      <StyledInput
        ref={uploadPhotoRef as React.RefObject<HTMLInputElement>}
        type="file"
        accept={acceptedFileFormats}
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
