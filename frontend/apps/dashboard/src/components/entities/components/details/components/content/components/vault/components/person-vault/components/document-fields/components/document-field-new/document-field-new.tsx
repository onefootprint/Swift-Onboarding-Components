import { useIntl, useToggle, useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  Document,
  EntityVault,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { Drawer, LinkButton, Select, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import { getDocumentVersion } from '../../utils';
import ConfidenceScores from './components/confidence-scores';
import ExtractedDocumentData from './components/extracted-document-data';
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
  const { t } = useTranslation('pages.entity.fieldset.document');
  const [isDrawerOpen, show, hide] = useToggle(false);
  const [activeDocumentVersion, setActiveDocumentVersion] = useState(
    getDocumentVersion(documents[0], documents),
  );
  const { formatDateWithTime } = useIntl();

  const documentOptions = documents.map(document => ({
    label: formatDateWithTime(new Date(document.startedAt)),
    value: getDocumentVersion(document, documents),
  }));

  const currentDocument = documents.find(
    document =>
      document?.completedVersion?.toString() === activeDocumentVersion ||
      documents[Number(activeDocumentVersion.replace('incomplete_', ''))],
  );

  return documentType ? (
    <Container>
      <Inner>
        <LabelContainer>
          <Typography variant="body-3" color="tertiary" as="label">
            {label}
          </Typography>
        </LabelContainer>
        {isDrawerOpen ? (
          <LinkButton onClick={hide}>{t('hide')}</LinkButton>
        ) : (
          <LinkButton onClick={show}>{t('show')}</LinkButton>
        )}
      </Inner>
      <Drawer
        closeAriaLabel={t('close-aria-label')}
        open={isDrawerOpen}
        title={t(`drawer.${documentType}.title`)}
        onClose={hide}
      >
        <DrawerItems>
          <Select
            placeholder={
              documentOptions.find(
                option => option.value === activeDocumentVersion.toString(),
              )?.label || ''
            }
            options={documentOptions}
            onChange={newOption => setActiveDocumentVersion(newOption.value)}
            value={documentOptions.find(
              option => option.value === activeDocumentVersion.toString(),
            )}
          />
          {currentDocument && <ConfidenceScores document={currentDocument} />}
          <ExtractedDocumentData
            vault={vault}
            documentType={documentType}
            activeDocumentVersion={activeDocumentVersion}
          />
          <Uploads currentDocument={currentDocument} vault={vault} />
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
`;

const DrawerItems = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `}
`;

const LabelContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    flex-direction: row;
    align-items: flex-end;
  `};
`;

export default DocumentField;
