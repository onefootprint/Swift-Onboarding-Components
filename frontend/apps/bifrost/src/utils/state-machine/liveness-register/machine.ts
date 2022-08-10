import { DeviceInfo } from 'hooks';
import { assign, createMachine } from 'xstate';

import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';

export type LivenessRegisterMachineArgs = {
  device: DeviceInfo;
  authToken?: string;
};

const createLivenessRegisterMachine = ({
  device,
  authToken,
}: LivenessRegisterMachineArgs) =>
  createMachine<MachineContext, MachineEvents>(
    {
      id: 'livenessRegister',
      initial: States.init,
      context: {
        authToken,
        device,
      },
      states: {
        [States.init]: {
          always: [
            {
              target: States.newTabRequest,
              cond: context =>
                context.device.type === 'mobile' &&
                context.device.hasSupportForWebauthn,
            },
            {
              target: States.livenessRegisterFailed,
              cond: context =>
                context.device.type === 'mobile' &&
                !context.device.hasSupportForWebauthn,
            },
            {
              target: States.qrRegister,
            },
          ],
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
              target: States.livenessRegisterSucceeded,
            },
            [Events.qrRegisterFailed]: {
              target: States.livenessRegisterFailed,
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
              target: States.livenessRegisterSucceeded,
            },
            [Events.qrRegisterFailed]: {
              target: States.livenessRegisterFailed,
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
              target: States.livenessRegisterSucceeded,
            },
            [Events.qrRegisterFailed]: {
              target: States.livenessRegisterFailed,
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
              target: States.livenessRegisterSucceeded,
            },
            [Events.newTabRegisterFailed]: {
              target: States.livenessRegisterFailed,
            },
            [Events.statusPollingErrored]: {
              target: States.newTabRequest,
              actions: [Actions.clearScopedAuthToken],
            },
          },
        },
        [States.livenessRegisterSucceeded]: {
          type: 'final',
        },
        [States.livenessRegisterFailed]: {
          type: 'final',
        },
      },
    },
    {
      actions: {
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

export default createLivenessRegisterMachine;
