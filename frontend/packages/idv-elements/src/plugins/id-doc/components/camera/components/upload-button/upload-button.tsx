import { IcoImages24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React, { useRef, useState } from 'react';

import useProcessImage from '../../../../hooks/use-process-image';
import { useIdDocMachine } from '../../../machine-provider';

const BUTTON_RADIUS = 56;

type UploadButtonProps = {
  onUpload: () => void;
  onComplete: () => void;
};

const UploadButton = ({ onUpload, onComplete }: UploadButtonProps) => {
  const [state, send] = useIdDocMachine();
  const { hasBadConnectivity } = state.context;
  const uploadPhotoRef = useRef<HTMLInputElement | undefined>();
  const { processImageFile, acceptedFileFormats } = useProcessImage();

  const [isLoading, setIsLoading] = useState(false);

  const onProcessingDone = () => {
    setIsLoading(false);
    onComplete();
  };

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    onUpload();
    const { files } = event.target;
    if (!files?.length) {
      onProcessingDone();
      return;
    }

    const processResult = await processImageFile(files[0], hasBadConnectivity);
    if (!processResult) {
      onProcessingDone();
      return;
    }

    send({
      type: 'receivedImage',
      payload: {
        imageFile: processResult.file,
        extraCompressed: processResult.extraCompressed,
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
        accept={acceptedFileFormats}
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
