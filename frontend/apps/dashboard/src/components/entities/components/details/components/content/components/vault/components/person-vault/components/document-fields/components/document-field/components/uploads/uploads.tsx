import { useIntl } from '@onefootprint/hooks';
import { IcoIdFront16, IcoInfo16, IcoUpload24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type {
  DataIdentifier,
  Document,
  DocumentUpload,
  EntityVault,
} from '@onefootprint/types';
import { IdDocImageTypes } from '@onefootprint/types';
import { createFontStyles, Tooltip, Typography } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import HoverableImage from './components/hoverable-image';
import getMimeType from './utils/get-mime-type';

export type UploadsProps = {
  vault: EntityVault;
  currentDocument?: Document;
};

const Uploads = ({ vault, currentDocument }: UploadsProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.fieldset.document.drawer.uploads',
  });
  const { formatTime } = useIntl();

  const getSrc = (side: IdDocImageTypes, version: string) => {
    const vaultIndex =
      `document.${currentDocument?.kind}.${side}.latest_upload:${version}` as DataIdentifier;
    const hasVaultValue = vaultIndex in vault;
    if (hasVaultValue) {
      const vaultValue = vault[vaultIndex];
      if (typeof vaultValue === 'string') {
        const mime = getMimeType(vaultValue);
        return `data:${mime};base64,${vaultValue}`;
      }
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
    return `${t(`${relevantUpload.side}`)} ${t(
      `document-types.${kind}` as ParseKeys<'common'>,
    )} ${t(relevantUpload.failureReasons.length ? 'failed' : 'success')}`;
  };

  const { uploadSource } = currentDocument;

  const uploadsSortedByDate = currentDocument.uploads.sort(
    (a, b) => Number(new Date(b.timestamp)) - Number(new Date(a.timestamp)),
  );

  const getFailureReasons = (relevantUpload: DocumentUpload) => {
    const reasons = relevantUpload.failureReasons.map(reason =>
      t(`failure-reasons.${reason}` as ParseKeys<'common'>),
    );
    const reasonsWithBullets = reasons.map(reason => `- ${reason}`).join('\n');
    return reasons.length > 1 ? reasonsWithBullets : reasons[0];
  };

  return (
    <Section>
      <Header>
        <LabelContainer>
          <IcoUpload24 />
          <Typography variant="label-2">{t('title')}</Typography>
        </LabelContainer>
        {!!uploadsSortedByDate.length && (
          <DocumentUploadContainer>
            <IcoInfo16 color="info" />
            <Typography
              color="info"
              variant="body-4"
              sx={{ whiteSpace: 'nowrap' }}
            >
              {`${t('uploaded-from')} ${t(
                `upload-source.${uploadSource}` as ParseKeys<'common'>,
              )}`}
            </Typography>
          </DocumentUploadContainer>
        )}
      </Header>
      {!uploadsSortedByDate.length && (
        <Row>
          <Typography variant="body-3">{t('no-uploads')}</Typography>
        </Row>
      )}
      {uploadsSortedByDate.map((upload, i) => (
        <Row key={upload.timestamp}>
          <Time>
            {formatTime(new Date(upload.timestamp))
              // AM --> am
              .toLowerCase()}
          </Time>
          <IconAndLine>
            <IconContainer>
              <IcoIdFront16 />
            </IconContainer>
            <Line data-last={i === currentDocument.uploads.length - 1} />
          </IconAndLine>
          <Content>
            <Title>
              <Typography variant="body-3">{getEventText(upload)}</Typography>
              {getFailureReasons(upload) && (
                <Tooltip alignment="end" text={getFailureReasons(upload)}>
                  <IcoInfo16 />
                </Tooltip>
              )}
              {!getFailureReasons(upload) && upload.isExtraCompressed && (
                <Tooltip alignment="end" text={t('extra-compressed')}>
                  <IcoInfo16 />
                </Tooltip>
              )}
            </Title>
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

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: ${theme.spacing[2]};
  `};
`;

const Time = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    white-space: nowrap;
    min-width: 70px;
    color: ${theme.color.tertiary};
    height: fit-content;
  `};
`;

const LabelContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    padding-bottom: ${theme.spacing[5]};
  `};
`;

const DocumentUploadContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    padding-bottom: ${theme.spacing[5]};
  `};
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Section = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
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
    gap: ${theme.spacing[6]};
    margin-bottom: ${theme.spacing[9]};
    white-space: pre-line;
  `}
`;

const IconAndLine = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-width: 16px;
  flex-shrink: 0;
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    position: relative;
    align-items: flex-start;
    justify-content: center;
    padding: 0 ${theme.spacing[4]};
    background: ${theme.backgroundColor.primary};
    margin-top: ${theme.spacing[2]};
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
