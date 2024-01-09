import { IcoImages24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React, { useRef, useState } from 'react';

import Logger from '../../../../../../utils/logger';
import useProcessImage from '../../../../hooks/use-process-image';
import { useIdDocMachine } from '../../../machine-provider';

const BUTTON_RADIUS = 56;

type UploadButtonProps = {
  onUploadBtnClick: () => void;
  onUploadChangeDone: () => void;
};

const logWarn = (e: string) => Logger.warn(e, 'upload-button');
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
}: UploadButtonProps) => {
  const [state, send] = useIdDocMachine();
  const { hasBadConnectivity } = state.context;
  const uploadPhotoRef = useRef<HTMLInputElement | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { processImageFile, acceptedFileFormats } = useProcessImage();

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

    const processResult = await processImageFile(files[0], hasBadConnectivity);
    if (!processResult) {
      logWarn('Captured image could not be processed - retaking the image');
      onProcessingDone();
      return;
    }

    logProcessedFile(processResult);
    send({
      type: 'receivedImage',
      payload: {
        imageFile: processResult.file,
        extraCompressed: processResult.extraCompressed,
        captureKind: 'upload',
      },
    });
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
