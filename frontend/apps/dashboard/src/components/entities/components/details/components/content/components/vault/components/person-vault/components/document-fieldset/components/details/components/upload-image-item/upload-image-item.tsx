import type { DocumentUpload, EntityVault } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import styled, { css } from 'styled-components';
import UploadTitleCard from '../upload-title-card';
import PdfThumbnail from './components/pdf-thumbnail';
import StyledImage from './components/styled-image';
import useUploadData from './hooks/use-upload-data/use-upload-data';

type UploadImageItemProps = {
  upload: DocumentUpload & { isLatest: boolean };
  vault: EntityVault;
  refCallback: (el: HTMLDivElement | null) => void;
  imageOnly?: boolean;
};

const UploadImageItem = ({ upload, vault, refCallback, imageOnly }: UploadImageItemProps) => {
  const { objectUrl, isPdf, di } = useUploadData(upload, vault);

  if (!objectUrl) return null;
  if (isPdf) return <PdfThumbnail src={objectUrl} />;

  return (
    <Upload
      key={`${upload.identifier}:${upload.version}`}
      ref={el => refCallback(el)}
      direction="column"
      align="center"
      gap={3}
      width="100%"
    >
      {!imageOnly && <UploadTitleCard upload={upload} />}
      <StyledImage alt={di} src={objectUrl} />
    </Upload>
  );
};

const Upload = styled(Stack)`
  ${({ theme }) => css`
    scroll-margin-top: ${theme.spacing[3]};
  `};
`;

export default UploadImageItem;
