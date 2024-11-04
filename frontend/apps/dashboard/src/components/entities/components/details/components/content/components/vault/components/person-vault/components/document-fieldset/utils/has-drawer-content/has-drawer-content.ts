import type { Document, EntityVault } from '@onefootprint/types';
import { getRelevantKeys } from '../../../document-fields/utils';

// Returns true if the document has confidence score or OCR data to be shown in the details drawer
const hasDrawerContent = (document: Document, vault: EntityVault) => {
  const confidenceScores = [document?.documentScore, document?.ocrConfidenceScore, document?.selfieScore];
  const hasScores = confidenceScores.filter(score => score || score === 0).length > 0;
  if (!hasScores) return false;

  const documentType = document.kind;
  const currentDocumentNumber = document.completedVersion?.toString();
  const relevantKeys = getRelevantKeys({
    vault,
    documentType,
    currentDocumentNumber,
  });
  return relevantKeys.length > 0;
};

export default hasDrawerContent;
