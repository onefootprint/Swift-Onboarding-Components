import type { DataIdentifier, DocumentUpload, EntityVault } from '@onefootprint/types';
import { Box, useObjectUrl } from '@onefootprint/ui';
import Image from 'next/image';
import styled, { css } from 'styled-components';
import { getSelfieIndex } from '../../../../utils/show-selfie-preview';

type SelfiePreviewProps = {
  uploads: DocumentUpload[];
  vault: EntityVault;
};

const SelfiePreview = ({ uploads, vault }: SelfiePreviewProps) => {
  const selfieIndex = getSelfieIndex(uploads);
  const selfie = uploads[selfieIndex];
  if (!selfie) return null;

  const vaultIndex = `${selfie.identifier}:${selfie.version}` as DataIdentifier;
  const base64Data = vault[vaultIndex] as string;
  const { objectUrl } = useObjectUrl(base64Data);
  if (!objectUrl) return null;

  return (
    <Container position="fixed" alignSelf="flex-start" zIndex="drawer">
      <StyledImage src={objectUrl} width={0} height={0} alt="selfie preview" />
    </Container>
  );
};

const Container = styled(Box)`
  ${({ theme }) => css`
    --dialog-header-height: 44px;
    top: calc(var(--dialog-header-height) + ${theme.spacing[4]});
    right: ${theme.spacing[4]};
  `};
`;

const StyledImage = styled(Image)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[2]};
    max-width: 160px;
    width: 100%;
    height: auto;
    object-fit: contain;
  `};
`;

export default SelfiePreview;
