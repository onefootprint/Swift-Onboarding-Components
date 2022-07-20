import { assign, createMachine } from 'xstate';

import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';

const initialContext: MachineContext = {};

const livenessCheckMachine = createMachine<MachineContext, MachineEvents>(
  {
    id: 'livenessCheck',
    initial: States.init,
    context: initialContext,
    states: {
      [States.init]: {
        on: {
          [Events.deviceInfoIdentified]: [
            {
              target: States.newTabRequest,
              actions: [Actions.assignDeviceInfo],
              cond: (context, event) =>
                event.payload.type === 'mobile' &&
                event.payload.hasSupportForWebAuthn,
            },
            {
              target: States.livenessCheckFailed,
              actions: [Actions.assignDeviceInfo],
              cond: (context, event) =>
                event.payload.type === 'mobile' &&
                !event.payload.hasSupportForWebAuthn,
            },
            {
              target: States.qrRegister,
            },
          ],
        },
      },
      [States.qrRegister]: {
        on: {
          [Events.scopedAuthTokenGenerated]: {
            actions: [Actions.assignScopedAuthToken],
          },
          [Events.qrCodeLinkSentViaSms]: {
            target: States.qrCodeSent,
          },
          [Events.qrCodeScanned]: {
            target: States.qrCodeScanned,
          },
          [Events.qrRegisterSucceeded]: {
            target: States.livenessCheckSucceeded,
          },
          [Events.qrRegisterFailed]: {
            target: States.livenessCheckFailed,
          },
          [Events.statusPollingErrored]: {
            actions: [Actions.clearScopedAuthToken],
          },
        },
      },
      [States.qrCodeScanned]: {
        on: {
          [Events.qrCodeCanceled]: {
            target: States.qrRegister,
            actions: [Actions.clearScopedAuthToken],
          },
          [Events.qrRegisterSucceeded]: {
            target: States.livenessCheckSucceeded,
          },
          [Events.qrRegisterFailed]: {
            target: States.livenessCheckFailed,
          },
          [Events.statusPollingErrored]: {
            target: States.qrRegister,
            actions: [Actions.clearScopedAuthToken],
          },
        },
      },
      [States.qrCodeSent]: {
        on: {
          [Events.qrCodeCanceled]: {
            target: States.qrRegister,
            actions: [Actions.clearScopedAuthToken],
          },
          [Events.qrRegisterSucceeded]: {
            target: States.livenessCheckSucceeded,
          },
          [Events.qrRegisterFailed]: {
            target: States.livenessCheckFailed,
          },
          [Events.statusPollingErrored]: {
            target: States.qrRegister,
            actions: [Actions.clearScopedAuthToken],
          },
        },
      },
      [States.newTabRequest]: {
        on: {
          [Events.scopedAuthTokenGenerated]: {
            actions: [Actions.assignScopedAuthToken],
          },
          [Events.newTabOpened]: {
            target: States.newTabProcessing,
            actions: [Actions.assignTab],
          },
        },
      },
      [States.newTabProcessing]: {
        on: {
          [Events.newTabRegisterCanceled]: {
            target: States.newTabRequest,
          },
          [Events.newTabRegisterSucceeded]: {
            target: States.livenessCheckSucceeded,
          },
          [Events.newTabRegisterFailed]: {
            target: States.livenessCheckFailed,
          },
          [Events.statusPollingErrored]: {
            target: States.newTabRequest,
            actions: [Actions.clearScopedAuthToken],
          },
        },
      },
      [States.livenessCheckSucceeded]: {
        type: 'final',
      },
      [States.livenessCheckFailed]: {
        type: 'final',
      },
    },
  },
  {
    actions: {
      [Actions.assignDeviceInfo]: assign((context, event) => {
        if (event.type === Events.deviceInfoIdentified) {
          context.device = { ...event.payload };
        }
        return context;
      }),
      [Actions.assignScopedAuthToken]: assign((context, event) => {
        if (event.type === Events.scopedAuthTokenGenerated) {
          context.scopedAuthToken = event.payload.scopedAuthToken;
        }
        return context;
      }),
      [Actions.assignTab]: assign((context, event) => {
        if (event.type === Events.newTabOpened) {
          context.tab = event.payload.tab;
        }
        return context;
      }),
      [Actions.clearTab]: assign((context, event) => {
        if (event.type === Events.newTabRegisterCanceled) {
          context.tab = undefined;
        }
        return context;
      }),
      [Actions.clearScopedAuthToken]: assign((context, event) => {
        if (
          event.type === Events.statusPollingErrored ||
          event.type === Events.qrCodeCanceled
        ) {
          context.scopedAuthToken = undefined;
        }
        return context;
      }),
    },
  },
);

export default livenessCheckMachine;
