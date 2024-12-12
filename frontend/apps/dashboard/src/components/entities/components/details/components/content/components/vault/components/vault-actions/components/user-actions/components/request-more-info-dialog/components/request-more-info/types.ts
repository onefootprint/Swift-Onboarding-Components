import type { CustomDocumentIdentifier } from '@onefootprint/types/src/data/di';
import type { SelectOption } from '@onefootprint/ui';

export enum RequestMoreInfoKind {
  Onboard = 'onboard',
  ProofOfAddress = 'proof_of_address',
  ProofOfSsn = 'proof_of_ssn',
  IdDocument = 'id_document',
  CustomDocument = 'custom_document',
}

export type CustomDocumentData = {
  customDocumentName: string;
  customDocumentIdentifier: CustomDocumentIdentifier;
  customDocumentDescription?: string;
};

export type TriggerFormData = {
  kinds: RequestMoreInfoKind[];
  collectSelfie: boolean;
  customDocument?: CustomDocumentData[];
  playbook?: SelectOption;
  note?: string;
  clearManualReview?: boolean;
};
