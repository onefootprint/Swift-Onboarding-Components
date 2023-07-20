import {
  IdDocImageTypes,
  IdDocStatus,
  SupportedIdDocTypes,
} from './id-doc-type';

export type DocumentUpload = {
  version: number;
  failureReasons: string[];
  side: IdDocImageTypes;
  timestamp: string;
};

export type Document = {
  completedVersion: number;
  kind: SupportedIdDocTypes;
  startedAt: string;
  status: IdDocStatus;
  uploads: DocumentUpload[];
  documentScore: number;
  selfieScore: number;
  ocrConfidenceScore: number;
};
