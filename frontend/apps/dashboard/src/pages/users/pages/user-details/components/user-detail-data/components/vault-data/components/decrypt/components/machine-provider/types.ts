import { IdDI, IdDocDI, InvestorProfileDI } from '@onefootprint/types';

export enum FieldSections {
  id = 'id',
  idDocument = 'id_document',
  investorProfile = 'investor_profile',
}

export type Fields = {
  [FieldSections.id]: Partial<Record<IdDI, boolean>>;
  [FieldSections.idDocument]: Partial<Record<IdDocDI, boolean>>;
  [FieldSections.investorProfile]: Partial<Record<InvestorProfileDI, boolean>>;
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
  assignIdDoc = 'assignIdDoc',
  assignReason = 'assignReason',
}

export type TextField = IdDI | InvestorProfileDI;

export type IdDocumentField = IdDocDI;

export type Context = {
  reason?: string;
  fields?: Fields;
  textFields?: TextField[];
  idDocumentFields?: IdDocumentField[];
};

export type MachineEvents =
  | { type: Event.started }
  | { type: Event.canceled }
  | {
      type: Event.submittedFields;
      payload: { fields: Fields };
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
        fields: Fields;
      };
    }
  | {
      value: State.confirmingReason;
      context: Context & {
        reason: string;
        fields: Fields;
      };
    }
  | {
      value: State.decrypting;
      context: Context & {
        reason: string;
        fields: Fields;
      };
    }
  | {
      value: State.decryptFailed;
      context: Context & {
        reason: string;
        fields: Fields;
      };
    };
