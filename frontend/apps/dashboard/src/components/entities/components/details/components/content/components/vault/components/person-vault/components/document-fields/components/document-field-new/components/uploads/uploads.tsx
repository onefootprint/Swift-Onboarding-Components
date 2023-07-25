import { useTranslation } from '@onefootprint/hooks';
import { IcoUpload24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { DataIdentifier, Document, EntityVault } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

type ExtractedDocumentDataProps = {
  vault: EntityVault;
  currentDocument?: Document;
};

const Uploads = ({ vault, currentDocument }: ExtractedDocumentDataProps) => {
  const { t } = useTranslation('pages.entity.fieldset.document');

  const getSrc = (side: string, version: string) => {
    const vaultIndex =
      `document.${currentDocument?.kind}.${side}.latest_upload:${version}` as DataIdentifier;
    const vaultValue = vault[vaultIndex];
    return vaultValue as string;
  };

  return currentDocument ? (
    <Section>
      <LabelContainer>
        <IcoUpload24 />
        <Typography variant="label-2">{t(`drawer.uploads.title`)}</Typography>
      </LabelContainer>
      {currentDocument.uploads.map(upload => (
        <StyledImage
          key={upload.timestamp}
          src={getSrc(upload.side, upload.version.toString())}
          width={0}
          height={0}
          style={{ width: '100%', height: 'auto' }}
          alt={upload.side}
        />
      ))}
    </Section>
  ) : null;
};

const LabelContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  `};
`;

const Section = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[5]};
    flex-direction: column;
    align-items: flex-start;
  `};
`;

const StyledImage = styled(Image)`
  object-fit: contain;
`;

export default Uploads;
