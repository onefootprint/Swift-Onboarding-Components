import { UserDataAttribute } from '@onefootprint/types';

export enum State {
  idle = 'idle',
  hydrated = 'hydrated',
  selectedField = 'selectedField',
  selectingFields = 'selectingFields',
  confirmingReason = 'confirmingReason',
  decrypting = 'decrypting',
  decryptFailed = 'decryptFailed',
}

export enum Event {
  hydrated = 'hydrated',
  started = 'started',
  canceled = 'canceled',
  selectedField = 'selectedField',
  submittedFields = 'submittedFields',
  submittedReason = 'submittedReason',
  decryptSucceeded = 'decryptSucceeded',
  decryptFailed = 'decryptFailed',
}

export enum Guard {
  hasAtLeastOneFieldSelected = 'hasAtLeastOneFieldSelected',
}

export enum Action {
  assignInitialFields = 'assignInitialFields',
  assignField = 'assignField',
  assignReason = 'assignReason',
}

export type Fields = Partial<Record<UserDataAttribute, boolean>>;

export type Context = {
  reason?: string;
  fields?: Fields;
};

export type MachineEvents =
  | {
      type: Event.hydrated;
      payload: { fields: Fields };
    }
  | { type: Event.started }
  | { type: Event.canceled }
  | { type: Event.selectedField }
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
      value: State.hydrated;
      context: Context & {
        fields: Fields;
      };
    }
  | {
      value: State.selectedField;
      context: Context & {
        fields: Fields;
      };
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
