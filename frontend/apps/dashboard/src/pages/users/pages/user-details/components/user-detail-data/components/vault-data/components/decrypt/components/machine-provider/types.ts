import { IdDI, IdDocDI, InvestorProfileDI } from '@onefootprint/types';
import { DocumentDI } from '@onefootprint/types/src/data/di';

export enum FieldSections {
  id = 'id',
  idDocument = 'id_document',
  investorProfile = 'investor_profile',
  document = 'document',
}

export type FormData = {
  [FieldSections.id]: Partial<Record<IdDI, boolean>>;
  [FieldSections.idDocument]: Partial<Record<IdDocDI, boolean>>;
  [FieldSections.investorProfile]: Partial<Record<InvestorProfileDI, boolean>>;
  [FieldSections.document]: Partial<Record<DocumentDI, boolean>>;
};

export enum State {
  idle = 'idle',
  selectingFields = 'selectingFields',
  confirmingReason = 'confirmingReason',
  decrypting = 'decrypting',
  decryptFailed = 'decryptFailed',
}

export enum Event {
  started = 'started',
  canceled = 'canceled',
  submittedFields = 'submittedFields',
  submittedReason = 'submittedReason',
  decryptSucceeded = 'decryptSucceeded',
  decryptFailed = 'decryptFailed',
}

export enum Guard {
  hasAtLeastOneFieldSelected = 'hasAtLeastOneFieldSelected',
}

export enum Action {
  assignFields = 'assignFields',
  assignText = 'assignText',
  assignIdDocument = 'assignIdDocument',
  assignDocument = 'assignDocument',
  assignReason = 'assignReason',
}

export type TextField = IdDI | InvestorProfileDI;

export type IdDocumentField = IdDocDI;

// For now, finraCompliance isn't officialy part of the investor profile CDO, but the idea in a long term
// is to have it there.
export type DocumentField = DocumentDI.finraComplianceLetter;

export type Context = {
  reason?: string;
  fields?: FormData;
  textFields?: TextField[];
  idDocumentFields?: IdDocumentField[];
  documentFields?: DocumentField[];
};

export type MachineEvents =
  | { type: Event.started }
  | { type: Event.canceled }
  | {
      type: Event.submittedFields;
      payload: { fields: FormData };
    }
  | {
      type: Event.submittedReason;
      payload: { reason: string };
    }
  | { type: Event.decryptSucceeded }
  | { type: Event.decryptFailed };

export type MachineStates =
  | {
      value: State.idle;
      context: Context;
    }
  | {
      value: State.selectingFields;
      context: Context & {
        fields: FormData;
      };
    }
  | {
      value: State.confirmingReason;
      context: Context & {
        reason: string;
        fields: FormData;
      };
    }
  | {
      value: State.decrypting;
      context: Context & {
        reason: string;
        fields: FormData;
      };
    }
  | {
      value: State.decryptFailed;
      context: Context & {
        reason: string;
        fields: FormData;
      };
    };
