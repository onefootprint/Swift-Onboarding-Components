import { useIntl } from '@onefootprint/hooks';
import { IcoIdFront16, IcoInfo16, IcoUpload24 } from '@onefootprint/icons';
import type { DataIdentifier, Document, DocumentUpload, EntityVault } from '@onefootprint/types';
import { IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';
import { Text, Tooltip, createFontStyles } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import HoverableImage from './components/hoverable-image';

export type UploadsProps = {
  vault: EntityVault;
  currentDocument?: Document;
};

const Uploads = ({ vault, currentDocument }: UploadsProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.fieldset.document.drawer.uploads',
  });
  const { formatTime } = useIntl();

  const getImgBase64Data = (upload: DocumentUpload) => {
    const vaultIndex = `${upload.identifier}:${upload.version}` as DataIdentifier;
    const hasVaultValue = vaultIndex in vault;
    if (hasVaultValue) {
      const vaultValue = vault[vaultIndex];
      if (typeof vaultValue === 'string') {
        return vaultValue;
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
      return `${t(`${relevantUpload.side}`)} ${t(relevantUpload.failureReasons.length ? 'failed' : 'success')}`;
    }
    // "Proof of Address successfully uploaded"
    if (kind === SupportedIdDocTypes.proofOfAddress) {
      return `${t(`document-types.${kind}` as ParseKeys<'common'>)} ${t(
        relevantUpload.failureReasons.length ? 'failed' : 'success',
      )}`;
    }
    // "ID (FRONT) successfully uploaded"
    return `${t(`document-types.${kind}` as ParseKeys<'common'>)} (${t(
      `${relevantUpload.side}`,
    )}) ${t(relevantUpload.failureReasons.length ? 'failed' : 'success')}`;
  };

  const { uploadSource } = currentDocument;

  const uploadsSortedByDate = currentDocument.uploads.sort(
    (a, b) => Number(new Date(b.timestamp)) - Number(new Date(a.timestamp)),
  );

  const getFailureReasons = (relevantUpload: DocumentUpload) => {
    const reasons = relevantUpload.failureReasons.map(reason => t(`failure-reasons.${reason}` as ParseKeys<'common'>));
    const reasonsWithBullets = reasons.map(reason => `- ${reason}`).join('\n');
    return reasons.length > 1 ? reasonsWithBullets : reasons[0];
  };

  return (
    <Section>
      <Header>
        <LabelContainer>
          <IcoUpload24 />
          <Text variant="label-2">{t('title')}</Text>
        </LabelContainer>
        {!!uploadsSortedByDate.length && (
          <DocumentUploadContainer>
            <IcoInfo16 color="info" />
            <Text color="info" variant="body-4" whiteSpace="nowrap">
              {`${t('uploaded-from')} ${t(`upload-source.${uploadSource}` as ParseKeys<'common'>)}`}
            </Text>
          </DocumentUploadContainer>
        )}
      </Header>
      {!uploadsSortedByDate.length && (
        <Row>
          <Text variant="body-3">{t('no-uploads')}</Text>
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
              <Text variant="body-3">{getEventText(upload)}</Text>
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
              base64Data={getImgBase64Data(upload)}
              documentName={t(`document-types.${currentDocument.kind}` as ParseKeys<'common'>)}
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
