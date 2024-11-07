import type { DocumentUpload, EntityVault } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import UploadTitleCard from '../upload-title-card';
import PdfThumbnail from './components/pdf-thumbnail';
import RotatedImage from './components/rotated-image';
import StyledImage from './components/styled-image';
import useUploadData from './hooks/use-upload-data/use-upload-data';

type UploadImageItemProps = {
  upload: DocumentUpload & { isLatest: boolean };
  vault: EntityVault;
  imageOnly?: boolean;
  rotateIndex?: number;
};

const UploadImageItem = forwardRef<HTMLDivElement, UploadImageItemProps>(
  ({ upload, vault, imageOnly, rotateIndex }, ref) => {
    const { objectUrl, isPdf, di } = useUploadData(upload, vault);

    if (!objectUrl) return null;
    if (isPdf) return <PdfThumbnail src={objectUrl} />;

    const hasRotateIndex = (index: number | undefined): index is number => index === 0 || Boolean(index);
    const shouldRotate = hasRotateIndex(rotateIndex);
    if (shouldRotate) {
      return <RotatedImage alt={di} src={objectUrl} ref={ref} rotateIndex={rotateIndex} />;
    }

    return (
      <Upload
        key={`${upload.identifier}:${upload.version}`}
        ref={ref}
        direction="column"
        align="center"
        gap={3}
        width="100%"
      >
        {!imageOnly && <UploadTitleCard upload={upload} />}
        <StyledImage alt={di} src={objectUrl} />
      </Upload>
    );
  },
);

const Upload = styled(Stack)`
  ${({ theme }) => css`
    scroll-margin-top: ${theme.spacing[3]};
  `};
`;

export default UploadImageItem;
