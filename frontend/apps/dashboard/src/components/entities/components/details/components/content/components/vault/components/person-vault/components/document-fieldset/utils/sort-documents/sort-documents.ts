import type { Document, DocumentUpload } from '@onefootprint/types';
import { compareAsc, parseISO } from 'date-fns';

const sortByTime = (a: Document | DocumentUpload, b: Document | DocumentUpload) => {
  const dateA = 'timestamp' in a ? a.timestamp : a.startedAt;
  const dateB = 'timestamp' in b ? b.timestamp : b.startedAt;
  if (!dateA || !dateB) return 0;
  return compareAsc(parseISO(dateB), parseISO(dateA));
};

const sortUploads = (uploads: DocumentUpload[]) => {
  return [...uploads].sort((a, b) => {
    // We display the document front, back, the selfie, other uploads, and failed uploads in that order
    const getPriority = ({ identifier, failureReasons }: DocumentUpload) => {
      if (failureReasons && failureReasons.length > 0) return 5;
      if (identifier.includes('front.latest_upload')) return 1;
      if (identifier.includes('back.latest_upload')) return 2;
      if (identifier.includes('selfie.latest_upload')) return 3;
      return 4;
    };
    // If same priority, sort by most recent first
    const priorityA = getPriority(a);
    const priorityB = getPriority(b);
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return sortByTime(a, b);
  });
};

const sortDocumentsAndUploads = (documents: Document[]) => {
  return [...documents]
    .sort((doc1, doc2) => sortByTime(doc1, doc2))
    .map(document => ({
      ...document,
      uploads: sortUploads(document.uploads),
    }));
};

export default sortDocumentsAndUploads;
