import type { Document, EntityVault } from '@onefootprint/types';
import ConfidenceScores from './components/confidence-scores';
import ExtractedDocumentData from './components/extracted-document-data';

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
    </>
  );
};

export default DrawerContent;
