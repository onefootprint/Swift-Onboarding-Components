import type { DataIdentifier } from './di';

export type DocumentRequestConfig =
  | {
      kind: DocumentRequestKind.Identity;
      data: {
        collectSelfie: boolean;
      };
    }
  | {
      kind: DocumentRequestKind.ProofOfSsn;
      data: {};
    }
  | {
      kind: DocumentRequestKind.ProofOfAddress;
      data: {};
    }
  | {
      kind: DocumentRequestKind.Custom;
      data: {
        name: string;
        identifier: DataIdentifier;
        description?: string;
      };
    };

export enum DocumentRequestKind {
  Identity = 'identity',
  ProofOfSsn = 'proof_of_ssn',
  ProofOfAddress = 'proof_of_address',
  Custom = 'custom',
}
