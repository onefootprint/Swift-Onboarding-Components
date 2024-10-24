import type { Document } from '@onefootprint/types';
import { compareAsc, parseISO } from 'date-fns';

const sortDocumentsByStartedAt = (documents: Document[]) => {
  return [...documents].sort((doc1, doc2) => {
    if (!doc1.startedAt || !doc2.startedAt) return 0;
    return compareAsc(parseISO(doc1.startedAt), parseISO(doc2.startedAt));
  });
};

export default sortDocumentsByStartedAt;
