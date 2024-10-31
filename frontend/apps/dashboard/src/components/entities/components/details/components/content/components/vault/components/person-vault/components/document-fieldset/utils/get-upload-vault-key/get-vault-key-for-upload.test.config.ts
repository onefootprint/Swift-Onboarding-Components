import { DocumentDI, IdDocImageTypes, SupportedIdDocTypes, UploadSource } from '@onefootprint/types';
import type { UploadWithDocument } from '../../types';

export const customDocumentUpload: UploadWithDocument = {
  document: {
    kind: SupportedIdDocTypes.custom,
    completedVersion: null,
    documentScore: null,
    selfieScore: null,
    ocrConfidenceScore: null,
    uploadSource: UploadSource.Mobile,
  },
  documentId: '1',
  identifier: 'document.custom.city_verification',
  version: 1,
  failureReasons: [],
  side: IdDocImageTypes.front,
  timestamp: '',
  isExtraCompressed: false,
};

export const documentUpload: UploadWithDocument = {
  document: {
    kind: SupportedIdDocTypes.passport,
    completedVersion: null,
    documentScore: null,
    selfieScore: null,
    ocrConfidenceScore: null,
    uploadSource: UploadSource.Mobile,
  },
  documentId: '2',
  identifier: DocumentDI.latestPassportCardFront,
  version: 123,
  failureReasons: [],
  side: IdDocImageTypes.front,
  timestamp: '',
  isExtraCompressed: false,
};
