import type { DataIdentifier } from './di';

export type CustomDocumentUploadSettings = 'prefer_upload' | 'prefer_capture';

export type CustomDocumentRequestData = {
  name: string;
  identifier: DataIdentifier;
  description?: string;
  requiresHumanReview: boolean;
  uploadSettings?: CustomDocumentUploadSettings;
};

export type DocumentRequestConfig =
  | {
      kind: DocumentRequestKind.Identity;
      data: {
        collectSelfie: boolean;
      };
    }
  | {
      kind: DocumentRequestKind.ProofOfSsn;
      data: {
        requiresHumanReview: boolean;
      };
    }
  | {
      kind: DocumentRequestKind.ProofOfAddress;
      data: {
        requiresHumanReview: boolean;
      };
    }
  | {
      kind: DocumentRequestKind.Custom;
      data: CustomDocumentRequestData;
    };

export enum DocumentRequestKind {
  Identity = 'identity',
  ProofOfSsn = 'proof_of_ssn',
  ProofOfAddress = 'proof_of_address',
  Custom = 'custom',
}
