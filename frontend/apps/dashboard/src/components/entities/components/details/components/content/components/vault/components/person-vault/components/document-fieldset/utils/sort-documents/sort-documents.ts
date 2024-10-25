import type { Document, DocumentUpload } from '@onefootprint/types';
import { compareAsc, parseISO } from 'date-fns';

const sortByTime = (a: Document | DocumentUpload, b: Document | DocumentUpload) => {
  const dateA = 'timestamp' in a ? a.timestamp : a.startedAt;
  const dateB = 'timestamp' in b ? b.timestamp : b.startedAt;
  if (!dateA || !dateB) return 0;
  return compareAsc(parseISO(dateB), parseISO(dateA));
};

const sortDocumentsAndUploads = (documents: Document[]) => {
  return [...documents]
    .sort((doc1, doc2) => sortByTime(doc1, doc2))
    .map(document => ({
      ...document,
      uploads: [...document.uploads].sort((a, b) => sortByTime(a, b)),
    }));
};

export default sortDocumentsAndUploads;
