import { UserDataAttribute } from 'types';
import { createMachine } from 'xstate';

type Fields = Partial<Partial<Record<UserDataAttribute, boolean>>>;

type DecryptContext = {
  reason?: string;
  fields?: Fields;
};

type DecryptEvent =
  | {
      type: 'HYDRATED';
      payload: { fields: Fields };
    }
  | { type: 'STARTED' }
  | { type: 'CANCELLED' }
  | { type: 'SELECTED_FIELD' }
  | {
      type: 'SUBMITTED_FIELDS';
      payload: { fields: Fields };
    }
  | {
      type: 'SUBMITTED_REASON';
      payload: { reason: string };
    }
  | { type: 'DECRYPT_SUCCEEDED' }
  | { type: 'DECRYPT_FAILED' };

type DecryptTypestate =
  | {
      value: 'IDLE';
      context: DecryptContext;
    }
  | {
      value: 'HYDRATED';
      context: DecryptContext & {
        fields: Fields;
      };
    }
  | {
      value: 'SELECTED_FIELD';
      context: DecryptContext & {
        fields: Fields;
      };
    }
  | {
      value: 'SELECTING_FIELDS';
      context: DecryptContext & {
        fields: Fields;
      };
    }
  | {
      value: 'CONFIRMING_REASON';
      context: DecryptContext & {
        reason: string;
        fields: Fields;
      };
    }
  | {
      value: 'DECRYPTING';
      context: DecryptContext & {
        reason: string;
        fields: Fields;
      };
    }
  | {
      value: 'DECRYPT_FAILED';
      context: DecryptContext & {
        reason: string;
        fields: Fields;
      };
    };

export const createDecryptStateMachine = () =>
  createMachine<DecryptContext, DecryptEvent, DecryptTypestate>(
    {
      id: 'user-decrypt-fields',
      predictableActionArguments: true,
      initial: 'IDLE',
      states: {
        IDLE: {
          on: {
            HYDRATED: {
              actions: 'assignInitialFields',
            },
            STARTED: {
              target: 'SELECTING_FIELDS',
            },
          },
        },
        SELECTING_FIELDS: {
          on: {
            CANCELLED: {
              target: 'IDLE',
            },
            SUBMITTED_FIELDS: {
              target: 'CONFIRMING_REASON',
              actions: 'assignField',
              cond: 'hasAtLeastOneFieldSelected',
            },
          },
        },
        CONFIRMING_REASON: {
          on: {
            CANCELLED: {
              target: 'SELECTING_FIELDS',
            },
            SUBMITTED_REASON: {
              target: 'DECRYPTING',
              actions: 'assignReason',
            },
          },
        },
        DECRYPTING: {
          on: {
            DECRYPT_SUCCEEDED: {
              target: 'IDLE',
            },
            DECRYPT_FAILED: {
              target: 'CONFIRMING_REASON',
            },
          },
        },
      },
    },
    {
      guards: {
        hasAtLeastOneFieldSelected: (context, event) => {
          if (event.type === 'SUBMITTED_FIELDS') {
            const { fields } = event.payload;
            const hasAnyFieldSelected = Object.keys(fields).length > 0;
            return hasAnyFieldSelected;
          }
          return false;
        },
      },
      actions: {
        assignInitialFields: (context, event) => {
          if (event.type === 'HYDRATED') {
            context.fields = event.payload.fields;
          }
        },
        assignField: (context, event) => {
          if (event.type === 'SUBMITTED_FIELDS') {
            context.fields = event.payload.fields;
          }
        },
        assignReason: (context, event) => {
          if (event.type === 'SUBMITTED_REASON') {
            context.reason = event.payload.reason;
          }
        },
      },
    },
  );

export default createDecryptStateMachine();
