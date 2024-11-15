import type { Document, EntityVault } from '@onefootprint/types';
import ConfidenceScores from './components/confidence-scores';
import ExtractedDocumentData from './components/extracted-document-data';
import RawJsonData from './components/raw-json-data';

export type DrawerContentProps = {
  document: Document;
  vault: EntityVault;
};

const DrawerContent = ({ document, vault }: DrawerContentProps) => {
  const activeDocumentVersion = document.completedVersion?.toString();

  return (
    <>
      <ConfidenceScores document={document} />
      <ExtractedDocumentData
        vault={vault}
        documentType={document.kind}
        activeDocumentVersion={activeDocumentVersion ?? ''}
      />
      <RawJsonData vault={vault} document={document} />
    </>
  );
};

export default DrawerContent;
