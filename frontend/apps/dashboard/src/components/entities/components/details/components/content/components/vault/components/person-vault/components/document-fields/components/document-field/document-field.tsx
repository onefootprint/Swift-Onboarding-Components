import { useToggle } from '@onefootprint/hooks';
import type {
  Document,
  EntityVault,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { Drawer, LinkButton, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { useEditControls } from '../../../../../vault-actions';
import { getDocumentStatus, getDocumentVersion } from '../../utils';
import DocumentStatusBadge from '../document-status-badge';
import ConfidenceScores from './components/confidence-scores';
import ExtractedDocumentData from './components/extracted-document-data';
import RawJsonData from './components/raw-json-data';
import SessionSelect from './components/session-select';
import Uploads from './components/uploads';

export type DocumentFieldProps = {
  label: string;
  vault: EntityVault;
  documentType?: SupportedIdDocTypes;
  documents: Document[];
};

const DocumentField = ({
  label,
  documentType,
  vault,
  documents,
}: DocumentFieldProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.fieldset.document',
  });
  const [isDrawerOpen, show, hide] = useToggle(false);
  const [activeDocumentVersion, setActiveDocumentVersion] = useState(
    getDocumentVersion(documents[documents.length - 1], documents),
  );
  const { inProgress: showEditView } = useEditControls();
  const documentStatus = getDocumentStatus({ documents, documentType });

  let currentDocument = documents.find(
    document =>
      document?.completedVersion?.toString() === activeDocumentVersion,
  );
  if (!currentDocument) {
    const docIndex = +activeDocumentVersion.replace('incomplete_', ''); // If the status/version of the document is "null", we use the format "incomplete_<array index>" as active version
    if (!Number.isNaN(docIndex) && documents.length > docIndex) {
      currentDocument = documents[docIndex];
    }
  }
  const curpCompletedVersion = currentDocument?.curpCompletedVersion;

  return documentType ? (
    <Container>
      <Inner>
        <LabelContainer>
          <Text variant="body-3" color="tertiary" tag="label">
            {label}
          </Text>
          {documentStatus && <DocumentStatusBadge status={documentStatus} />}
        </LabelContainer>
        {showEditView ? (
          <Text variant="body-3" color="tertiary">
            {t('cannot-edit')}
          </Text>
        ) : (
          <LinkButton onClick={show}>{t('see-details')}</LinkButton>
        )}
      </Inner>
      <Drawer
        closeAriaLabel={t('close-aria-label')}
        open={isDrawerOpen}
        title={
          t(`drawer.${documentType}.title` as ParseKeys<'common'>) as string
        }
        onClose={hide}
        headerComponent={
          <SessionSelect
            onActiveDocumentVersionChange={setActiveDocumentVersion}
            documents={documents}
            activeDocumentVersion={activeDocumentVersion}
          />
        }
      >
        <DrawerItems>
          {currentDocument && <ConfidenceScores document={currentDocument} />}
          <ExtractedDocumentData
            vault={vault}
            documentType={documentType}
            activeDocumentVersion={activeDocumentVersion}
          />
          <Uploads currentDocument={currentDocument} vault={vault} />
          <RawJsonData
            vault={vault}
            documentType={documentType}
            curpCompletedVersion={curpCompletedVersion}
          />
        </DrawerItems>
      </Drawer>
    </Container>
  ) : null;
};

const Container = styled.div``;

const Inner = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
  align-items: center;
`;

const DrawerItems = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[9]};
    padding-bottom: ${theme.spacing[8]};
  `}
`;

const LabelContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]};
    flex-direction: row;
    align-items: center;
    justify-content: center;
  `};
`;

export default DocumentField;
