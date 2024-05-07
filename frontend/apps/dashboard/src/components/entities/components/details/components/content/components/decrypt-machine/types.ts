import type { DataIdentifier } from '@onefootprint/types';

import type { DecryptFormData } from '../vault/vault.types';

export enum State {
  idle = 'idle',
  selectingFields = 'selectingFields',
  confirmingReason = 'confirmingReason',
  confirmingDecryptAllReason = 'confirmingDecryptAllReason',
  decrypting = 'decrypting',
  decryptingAll = 'decryptingAll',
  decryptFailed = 'decryptFailed',
}

export enum Event {
  started = 'started',
  canceled = 'canceled',
  submittedFields = 'submittedFields',
  submittedAllFields = 'submittedAllFields',
  submittedReason = 'submittedReason',
  decryptSucceeded = 'decryptSucceeded',
  decryptFailed = 'decryptFailed',
}

export enum Guard {
  hasAtLeastOneFieldSelected = 'hasAtLeastOneFieldSelected',
}

export enum Action {
  assignFields = 'assignFields',
  assignReason = 'assignReason',
}

export type Context = {
  reason?: string;
  fields?: DecryptFormData;
  dis?: DataIdentifier[];
};

export type MachineEvents =
  | { type: Event.started }
  | { type: Event.canceled }
  | {
      type: Event.submittedFields;
      payload: { fields: DecryptFormData };
    }
  | {
      type: Event.submittedAllFields;
      payload: { fields: DataIdentifier[] };
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
        fields: DecryptFormData;
      };
    }
  | {
      value: State.confirmingReason;
      context: Context & {
        reason: string;
        fields: DecryptFormData;
      };
    }
  | {
      value: State.confirmingDecryptAllReason;
      context: Context & {
        reason: string;
        fields: DecryptFormData;
      };
    }
  | {
      value: State.decrypting;
      context: Context & {
        reason: string;
        fields: DecryptFormData;
      };
    }
  | {
      value: State.decryptingAll;
      context: Context & {
        reason: string;
        fields: DecryptFormData;
      };
    }
  | {
      value: State.decryptFailed;
      context: Context & {
        reason: string;
        fields: DecryptFormData;
      };
    };
