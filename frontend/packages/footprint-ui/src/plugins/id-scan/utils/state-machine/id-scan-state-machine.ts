import { assign, createMachine } from 'xstate';

import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';

const createIdScanMachine = () =>
  createMachine<MachineContext, MachineEvents>(
    {
      id: 'idScan',
      initial: States.init,
      context: {
        retryCount: 0,
      },
      states: {
        [States.init]: {
          on: {
            [Events.receivedContext]: {
              target: States.idCountryAndTypeSelection,
              actions: Actions.assignContext,
            },
          },
        },
        [States.idCountryAndTypeSelection]: {
          on: {
            [Events.idCountryAndTypeSelected]: {
              target: States.takeOrUploadFrontPhoto,
              actions: Actions.assignIdCountryAndType,
            },
          },
        },
        [States.takeOrUploadFrontPhoto]: {
          on: {
            [Events.receivedFrontImage]: {
              target: States.takeOrUploadBackPhoto,
              actions: Actions.assignFrontImage,
            },
          },
        },
        [States.takeOrUploadBackPhoto]: {
          on: {
            [Events.receivedBackImage]: {
              target: States.success,
              actions: Actions.assignBackImage,
            },
          },
        },
        [States.success]: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        [Actions.assignContext]: assign((context, event) => {
          if (event.type === Events.receivedContext) {
            const { authToken, device } = event.payload;
            context.authToken = authToken;
            context.device = device;
          }
          return context;
        }),
        [Actions.assignIdCountryAndType]: assign((context, event) => {
          if (event.type === Events.idCountryAndTypeSelected) {
            context.type = event.payload.type;
            context.country = event.payload.country;
          }
          return context;
        }),
        [Actions.assignFrontImage]: assign((context, event) => {
          if (event.type === Events.receivedFrontImage) {
            context.frontImage = event.payload.image;
          }
          return context;
        }),
        [Actions.assignBackImage]: assign((context, event) => {
          if (event.type === Events.receivedBackImage) {
            context.backImage = event.payload.image;
          }
          return context;
        }),
      },
    },
  );

export default createIdScanMachine;
