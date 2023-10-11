import { IcoImages24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React, { useRef, useState } from 'react';

import useProcessImage from '../../../../hooks/use-process-image';
import { useIdDocMachine } from '../../../machine-provider';

const BUTTON_RADIUS = 56;

type UploadButtonProps = {
  onUpload: () => void;
  onComplete: (imageString?: string, mimeType?: string) => void;
};

const UploadButton = ({ onUpload, onComplete }: UploadButtonProps) => {
  const [state, send] = useIdDocMachine();
  const { hasBadConnectivity } = state.context;
  const uploadPhotoRef = useRef<HTMLInputElement | undefined>();
  const { processImageFile } = useProcessImage();

  const [isLoading, setIsLoading] = useState(false);

  const onProcessingDone = (imageString?: string, mimeType?: string) => {
    setIsLoading(false);
    onComplete(imageString, mimeType);
  };

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    onUpload();
    const { files } = event.target;
    if (!files?.length) {
      onProcessingDone();
      return;
    }

    const processedImageFile = await processImageFile(
      files[0],
      hasBadConnectivity,
    );
    if (!processedImageFile) {
      onProcessingDone();
      return;
    }

    send({
      type: 'receivedImage',
      payload: {
        imageFile: processedImageFile,
      },
    });
    onProcessingDone();
  };

  const handleUpload = () => {
    uploadPhotoRef.current?.click();
  };

  return (
    <>
      <RoundButton
        onClick={handleUpload}
        radius={BUTTON_RADIUS}
        disabled={isLoading}
      >
        <IcoImages24 color="quinary" />
      </RoundButton>
      <StyledInput
        ref={uploadPhotoRef as React.RefObject<HTMLInputElement>}
        type="file"
        accept="image/*,.heic,.heif"
        onChange={handleImage}
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
