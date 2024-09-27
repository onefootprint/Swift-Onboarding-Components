import type { DataIdentifier } from '@onefootprint/types';
import type { EditFormData } from '../vault/components/vault-actions/components/edit-vault-drawer/edit-vault-drawer.types';

export enum State {
  idle = 'idle',
  editingFields = 'editingFields',
  savingEdit = 'savingEdit',
  editFailed = 'editFailed',
}

export enum Event {
  started = 'started',
  canceled = 'canceled',
  submittedFields = 'submittedFields',
  editSucceeded = 'editSucceeded',
  editFailed = 'editFailed',
}

export enum Action {
  assignFields = 'assignFields',
}

export type Context = {
  fields?: EditFormData;
  dis?: DataIdentifier[];
};

export type MachineEvents =
  | { type: Event.started }
  | { type: Event.canceled }
  | {
      type: Event.submittedFields;
      payload: { fields: EditFormData };
    }
  | { type: Event.editSucceeded }
  | { type: Event.editFailed };

export type MachineStates =
  | {
      value: State.idle;
      context: Context;
    }
  | {
      value: State.editingFields;
      context: Context & {
        fields: EditFormData;
      };
    }
  | {
      value: State.savingEdit;
      context: Context & {
        reason: string;
        fields: EditFormData;
      };
    }
  | {
      value: State.editFailed;
      context: Context & {
        reason: string;
        fields: EditFormData;
      };
    };
