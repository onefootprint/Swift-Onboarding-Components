import { IcoImages24 } from '@onefootprint/icons';
import { useToast } from '@onefootprint/ui';
import React, { useRef, useState } from 'react';
import styled, { css } from 'styled-components';

import Logger from '../../../../../../utils/logger';
import useProcessImage from '../../../../hooks/use-process-image';
import type { CaptureKind } from '../../../../types';

const BUTTON_RADIUS = 56;

type UploadButtonProps = {
  onUploadBtnClick: () => void;
  onUploadChangeDone: () => void;
  onUploadSuccess: (
    imageFile: File | Blob,
    extraCompressed: boolean,
    captureKind: CaptureKind,
  ) => void;
  allowPdf: boolean;
  hasBadConnectivity?: boolean;
};

const logWarn = (e: string) => Logger.warn(e, { location: 'upload-button' });
const logProcessedFile = (res: {
  file: File | Blob;
  extraCompressed: boolean;
}) => {
  Logger.info(
    `UploadButton: size of the processed file to be sent in machine event type 'receivedImage' is ${res.file.size}, file type ${res.file.type}`,
  );
};

const UploadButton = ({
  onUploadBtnClick,
  onUploadChangeDone,
  onUploadSuccess,
  allowPdf,
  hasBadConnectivity,
}: UploadButtonProps) => {
  const uploadPhotoRef = useRef<HTMLInputElement | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { processImageFile, acceptedFileFormats } = useProcessImage({
    allowPdf,
  });
  const toast = useToast();

  const onProcessingDone = () => {
    setIsLoading(false);
    onUploadChangeDone();
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setIsLoading(true);
    onUploadBtnClick();
    const { files } = event.target;

    if (!files?.length) {
      onProcessingDone();
      return;
    }

    if (!files[0].type.startsWith('image')) {
      logWarn('Uploaded file is not an image');
      toast.show({
        title: 'Uh-oh',
        description: `Only image files are supported. Please try again.`,
      });
      onProcessingDone();
      return;
    }

    const processResult = await processImageFile(files[0], hasBadConnectivity);
    if (!processResult) {
      logWarn('Captured image could not be processed - retaking the image');
      onProcessingDone();
      return;
    }

    logProcessedFile(processResult);
    onUploadSuccess(
      processResult.file,
      processResult.extraCompressed,
      'upload',
    );
    onProcessingDone();
  };

  const handleUploadClick = () => uploadPhotoRef.current?.click();

  return (
    <>
      <RoundButton
        onClick={handleUploadClick}
        radius={BUTTON_RADIUS}
        disabled={isLoading}
      >
        <IcoImages24 color="quinary" />
      </RoundButton>
      <StyledInput
        ref={uploadPhotoRef as React.RefObject<HTMLInputElement>}
        type="file"
        accept={acceptedFileFormats}
        onChange={handleImageChange}
      />
    </>
  );
};

const RoundButton = styled.button<{
  radius: number;
}>`
  ${({ theme, radius }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${radius}px;
    width: ${radius}px;
    background-color: #00000033;
    border: none;
    border-radius: 50%;
    position: absolute;
    bottom: ${theme.spacing[7]};
    left: ${theme.spacing[5]};
    box-shadow: ${theme.elevation[2]};

    &:hover {
      cursor: pointer;
    }
  `}
`;

const StyledInput = styled.input`
  display: none;
`;

export default UploadButton;
