import type { DataIdentifier, DocumentUpload, EntityVault } from '@onefootprint/types';
import { useObjectUrl } from '@onefootprint/ui';
import Image from 'next/image';
import styled, { css } from 'styled-components';
import PdfThumbnail from './components/pdf-thumbnail';
import UploadTitleCard from './components/upload-title-card';

type UploadImageItemProps = {
  upload: DocumentUpload & { isLatest: boolean };
  vault: EntityVault;
};

const UploadImageItem = ({ upload, vault }: UploadImageItemProps) => {
  const { identifier: di, version } = upload;
  const vaultIndex = `${di}:${version}` as DataIdentifier;
  const base64Data = (vault[vaultIndex] ?? vault[di]) as string;
  const { objectUrl, mimeType } = useObjectUrl(base64Data);
  const isPdf = mimeType === 'application/pdf';

  if (!objectUrl) {
    return null;
  }

  return isPdf ? (
    <PdfThumbnail src={objectUrl} />
  ) : (
    <>
      <UploadTitleCard upload={upload} />
      <StyledImage src={objectUrl} width={0} height={0} alt={di} />
    </>
  );
};

const StyledImage = styled(Image)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[2]};
    max-width: 100%;
    width: 100%;
    height: auto;
    object-fit: contain;
  `};
`;

export default UploadImageItem;
