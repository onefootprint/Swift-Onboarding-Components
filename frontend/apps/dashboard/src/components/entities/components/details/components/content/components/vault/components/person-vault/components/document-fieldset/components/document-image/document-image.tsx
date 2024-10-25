import { useObjectUrl } from '@onefootprint/ui';
import Image from 'next/image';
import styled, { css } from 'styled-components';

type DocumentImageProps = {
  base64Data: string;
  documentName: string;
  isSuccess: boolean;
};

const DocumentImage = ({ base64Data, documentName }: DocumentImageProps) => {
  const { objectUrl, mimeType } = useObjectUrl(base64Data);
  const isPdf = mimeType === 'application/pdf';

  if (!objectUrl) {
    return null;
  }

  return isPdf ? null : <StyledImage src={objectUrl} width={0} height={0} alt={documentName} />;
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

export default DocumentImage;
