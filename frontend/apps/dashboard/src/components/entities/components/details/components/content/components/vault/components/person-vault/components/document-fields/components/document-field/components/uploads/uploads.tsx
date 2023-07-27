import { useIntl, useTranslation } from '@onefootprint/hooks';
import { IcoIdFront16, IcoUpload24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  DataIdentifier,
  Document,
  DocumentUpload,
  EntityVault,
  IdDocImageTypes,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import HoverableImage from './components/hoverable-image';

export type UploadsProps = {
  vault: EntityVault;
  currentDocument?: Document;
};

const Uploads = ({ vault, currentDocument }: UploadsProps) => {
  const { t } = useTranslation('pages.entity.fieldset.document.drawer.uploads');
  const { formatTime } = useIntl();

  const getSrc = (side: IdDocImageTypes, version: string) => {
    const vaultIndex =
      `document.${currentDocument?.kind}.${side}.latest_upload:${version}` as DataIdentifier;
    const hasVaultValue = vaultIndex in vault;
    if (hasVaultValue) {
      const vaultValue = vault[vaultIndex];
      return `data:image/jpg;base64,${vaultValue}`;
    }
    return '';
  };

  if (!currentDocument) {
    return null;
  }

  const getEventText = (relevantUpload: DocumentUpload) => {
    const { kind } = currentDocument;
    // "Selfie successfully uploaded"
    if (relevantUpload.side === IdDocImageTypes.selfie) {
      return `${t(`${relevantUpload.side}`)} ${t(
        relevantUpload.failureReasons.length ? 'failed' : 'success',
      )}`;
    }
    // "Front ID successfully uploaded"
    return `${t(`${relevantUpload.side}`)} ${t(`document-types.${kind}`)} ${t(
      relevantUpload.failureReasons.length ? 'failed' : 'success',
    )}`;
  };

  return (
    <Section>
      <LabelContainer>
        <IcoUpload24 />
        <Typography variant="label-2">{t(`title`)}</Typography>
      </LabelContainer>
      {currentDocument.uploads.map((upload, i) => (
        <Row key={upload.timestamp}>
          <Typography
            sx={{ whiteSpace: 'nowrap', minWidth: '70px' }}
            variant="label-3"
            color="tertiary"
          >
            {formatTime(new Date(upload.timestamp))
              // AM --> am
              .toLowerCase()}
          </Typography>
          <IconAndLine>
            <IconContainer>
              <IcoIdFront16 />
            </IconContainer>
            <Line data-last={i === currentDocument.uploads.length - 1} />
          </IconAndLine>
          <Content>
            <Typography variant="body-3">{getEventText(upload)}</Typography>
            <HoverableImage
              isSuccess={upload.failureReasons.length === 0}
              src={getSrc(upload.side, upload.version.toString())}
            />
          </Content>
        </Row>
      ))}
    </Section>
  );
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

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  height: auto;
  align-items: stretch;
  position: relative;
`;

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    margin-top: ${theme.spacing[2]};
    gap: ${theme.spacing[6]};
    margin-bottom: ${theme.spacing[9]};
  `}
`;

const IconAndLine = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-width: 16px;
    flex-shrink: 0;
    margin-top: ${theme.spacing[2]};
  `};
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    position: relative;
    align-items: flex-start;
    justify-content: center;
    padding: 0 ${theme.spacing[4]};
    background: ${theme.backgroundColor.primary};
    z-index: 3;
  `};
`;

const Line = styled.div`
  ${({ theme }) => css`
    z-index: 0;
    width: 0px;
    height: 100%;
    margin-top: ${theme.spacing[3]};
    border-left: ${theme.borderWidth[2]} solid ${theme.borderColor.primary};
    &[data-last='true'] {
      border-left: ${theme.borderWidth[2]} solid
        ${theme.backgroundColor.transparent};
    }
    &[data-dashed='true'] {
      border-left: ${theme.borderWidth[2]} dashed ${theme.borderColor.primary};
    }
  `}
`;

export default Uploads;
