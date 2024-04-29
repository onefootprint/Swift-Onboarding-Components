import { primitives } from '@onefootprint/design-tokens';
import { IdDocImageUploadError } from '@onefootprint/types';
import React, { useRef, useState } from 'react';
import styled, { css } from 'styled-components';

import useProcessImage from '../../../../hooks/use-process-image';
import handleFileUpload from '../../utils/handle-file-upload';

type DraggableInputFieldProps = {
  children?: React.ReactNode;
  hasError?: boolean;
  height: number;
  onComplete: (image: File) => void;
  isLoading?: boolean;
  onUploadError: (errors: IdDocImageUploadError[]) => void;
  allowPdf?: boolean;
};

const DraggableInputField = ({
  children,
  hasError,
  height,
  onComplete,
  isLoading,
  onUploadError,
  allowPdf,
}: DraggableInputFieldProps) => {
  const [dragActive, setDragActive] = useState(false);
  const uploadPhotoRef = useRef<HTMLInputElement | undefined>();
  const { acceptedFileFormats } = useProcessImage({ allowPdf });

  const handleFileDrop = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    setDragActive(false);
    if (ev.dataTransfer.items) {
      const files: File[] = [];
      [...ev.dataTransfer.items].forEach(item => {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      });
      handleFileUpload({
        files,
        onSuccess: onComplete,
        onError: onUploadError,
        allowPdf,
      });
    } else {
      onUploadError([IdDocImageUploadError.unknownUploadError]);
    }
  };

  const handleDrag = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
  };

  const handleDragEnter = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    setDragActive(false);
  };

  const handleImageUpload = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = ev.target;
    handleFileUpload({
      files,
      onSuccess: onComplete,
      onError: onUploadError,
      allowPdf,
    });
  };

  const handleUpload = () => {
    uploadPhotoRef.current?.click();
  };

  return (
    <Container>
      <UploadBox
        onDrop={handleFileDrop}
        onDragOver={handleDrag}
        onDragLeave={handleDragLeave}
        onDragEnter={handleDragEnter}
        dragActive={dragActive}
        activeBackgroundColorCode={primitives.Purple50}
        data-error={hasError}
        height={height}
        data-loading={!!isLoading}
        onClick={handleUpload}
      >
        {children}
      </UploadBox>
      <StyledInput
        ref={uploadPhotoRef as React.RefObject<HTMLInputElement>}
        type="file"
        accept={acceptedFileFormats}
        onChange={handleImageUpload}
        aria-label="file-input"
      />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    gap: ${theme.spacing[7]};
  `}
`;

const UploadBox = styled.div<{
  dragActive: boolean;
  activeBackgroundColorCode: string;
  height: number;
}>`
  ${({ theme, dragActive, activeBackgroundColorCode, height }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: ${height}px;
    background-color: ${dragActive
      ? activeBackgroundColorCode
      : theme.backgroundColor.secondary};
    border: 1px dashed
      ${dragActive ? theme.borderColor.secondary : theme.borderColor.primary};
    border-radius: ${theme.borderRadius.default};
    cursor: pointer;

    &[data-error='true'] {
      background-color: ${theme.backgroundColor.secondary};
      border: 1px solid ${theme.borderColor.error};
    }

    &:active {
      background-color: ${activeBackgroundColorCode};
      border: 1px dashed ${theme.borderColor.secondary};
    }

    &[data-loading='true'] {
      background-color: ${theme.backgroundColor.neutral};
      pointer-events: none;
      > * {
        pointer-events: none;
      }
    }

    > * {
      pointer-events: ${dragActive ? 'none' : 'all'};
    }
  `}
`;

const StyledInput = styled.input`
  display: none;
`;

export default DraggableInputField;
