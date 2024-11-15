import type { DocumentUpload, EntityVault, IdDocImageProcessingError } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import UploadTitleCard from '../upload-title-card';
import PdfThumbnail from './components/pdf-thumbnail';
import UploadImage from './components/upload-image';
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

    const uploadImage = (
      <UploadImage
        objectUrl={objectUrl}
        alt={di}
        failureReasons={upload.failureReasons as IdDocImageProcessingError[]}
        rotateIndex={rotateIndex}
      />
    );

    return (
      <Container ref={ref} direction="column" align="center" gap={3} width="100%">
        {imageOnly ? (
          uploadImage
        ) : (
          <>
            <UploadTitleCard upload={upload} />
            {uploadImage}
          </>
        )}
      </Container>
    );
  },
);

const Container = styled(Stack)`
  ${({ theme }) => css`
    scroll-margin-top: ${theme.spacing[3]};
  `};
`;

export default UploadImageItem;
