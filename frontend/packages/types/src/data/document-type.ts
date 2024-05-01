import type {
  IdDocImageTypes,
  IdDocStatus,
  SupportedIdDocTypes,
} from './id-doc-type';

export type DocumentUpload = {
  version: number;
  failureReasons: string[];
  side: IdDocImageTypes;
  timestamp: string;
  isExtraCompressed: boolean;
};

export enum UploadSource {
  Mobile = 'mobile',
  Desktop = 'desktop',
  Api = 'api',
}

export type Document = {
  completedVersion: number | null;
  kind: SupportedIdDocTypes;
  startedAt?: string;
  status?: IdDocStatus;
  uploads: DocumentUpload[];
  documentScore: number | null;
  selfieScore: number | null;
  ocrConfidenceScore: number | null;
  uploadSource: UploadSource;
  curpCompletedVersion?: string | null;
};

export enum RawJsonKinds {
  CurpValidationResponse = 'curp_validation_response',
}
