import { Button } from '@onefootprint/ui';
import type React from 'react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { Logger } from '@/idv/utils';
import useProcessImage from '../../hooks/use-process-image';
import type { ReceivedImagePayload } from '../../types';

type IdDocPhotoButtonsProp = {
  onComplete: (payload: ReceivedImagePayload) => void;
  uploadFirst?: boolean;
  hideCaptureButton?: boolean;
  hideUploadButton?: boolean;
  allowPdf?: boolean;
  hasBadConnectivity?: boolean;
  onTakePhoto?: () => void;
  fallbackUpload?: boolean;
  isNativeCameraCapture?: boolean;
  nativeCameraFacingMode?: 'environment' | 'user';
};

const IdDocPhotoButtons = ({
  onComplete,
  uploadFirst,
  hideCaptureButton,
  hideUploadButton,
  allowPdf,
  hasBadConnectivity,
  onTakePhoto,
  fallbackUpload,
  isNativeCameraCapture,
  nativeCameraFacingMode,
}: IdDocPhotoButtonsProp) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.components.photo-upload-buttons',
  });
  const uploadPhotoRef = useRef<HTMLInputElement | undefined>();
  const capturePhotoRef = useRef<HTMLInputElement | undefined>();
  const { processImageFile, acceptedFileFormats } = useProcessImage({
    allowPdf,
  });
  const showCaptureButton = !hideCaptureButton;
  const showUploadButton = !hideUploadButton;

  const [isLoading, setIsLoading] = useState(false);
  const [captureMethod, setCaptureMethod] = useState<'take' | 'upload' | undefined>();

  const onProcessingDone = () => {
    setIsLoading(false);
    setCaptureMethod(undefined);
  };

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const { files } = event.target;
    if (!files?.length) {
      onProcessingDone();
      Logger.error('Image upload failed. No image files detected', {
        location: 'id-doc-photo-buttons',
      });
      return;
    }

    const processResult = await processImageFile(files[0], hasBadConnectivity);
    if (!processResult) {
      Logger.error('Image upload failed. Uploaded image could not be processed', { location: 'id-doc-photo-buttons' });
      onProcessingDone();
      return;
    }
    const { file, extraCompressed } = processResult;

    Logger.info(
      `IdDocPhotoButtons: size of the processed file to be sent in machine event type 'receivedImage' is ${file.size}, file type ${file.type}`,
    );

    onComplete({
      imageFile: file,
      extraCompressed,
      captureKind: captureMethod === 'upload' ? 'upload' : 'manual',
      forcedUpload: !!fallbackUpload && captureMethod === 'upload',
    });
    onProcessingDone();
  };

  const handleUpload = () => {
    setCaptureMethod('upload');
    uploadPhotoRef.current?.click();
  };

  const handleNativeCameraCapture = () => {
    setCaptureMethod('take');
    capturePhotoRef.current?.click();
  };

  return (
    <ButtonsContainer>
      {!!uploadFirst && showUploadButton && (
        <Button
          fullWidth
          variant="primary"
          onClick={handleUpload}
          loading={isLoading && captureMethod === 'upload'}
          disabled={isLoading}
          size="large"
          data-dd-action-name="doc:upload-photo"
        >
          {allowPdf ? t('upload-file.title') : t('upload-photo.title')}
        </Button>
      )}
      {showCaptureButton && (
        <Button
          fullWidth
          onClick={isNativeCameraCapture ? handleNativeCameraCapture : onTakePhoto}
          variant={uploadFirst ? 'secondary' : 'primary'}
          loading={isLoading && captureMethod === 'take'}
          disabled={isLoading}
          size="large"
          data-dd-action-name="doc:take-photo"
        >
          {t('take-photo.title')}
        </Button>
      )}
      {!uploadFirst && showUploadButton && (
        <Button
          fullWidth
          variant={hideCaptureButton ? 'primary' : 'secondary'}
          onClick={handleUpload}
          loading={isLoading && captureMethod === 'upload'}
          disabled={isLoading}
          size="large"
          data-dd-action-name="doc:upload-photo"
        >
          {allowPdf ? t('upload-file.title') : t('upload-photo.title')}
        </Button>
      )}
      <HiddenInput
        ref={uploadPhotoRef as React.RefObject<HTMLInputElement>}
        type="file"
        accept={acceptedFileFormats}
        onChange={handleImage}
        aria-label="file-input"
      />
      <HiddenInput
        ref={capturePhotoRef as React.RefObject<HTMLInputElement>}
        type="file"
        accept="image/*"
        onChange={handleImage}
        aria-label="photo-input"
        capture={nativeCameraFacingMode}
      />
    </ButtonsContainer>
  );
};

const HiddenInput = styled.input`
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
