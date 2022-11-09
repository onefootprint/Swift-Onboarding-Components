import { assign, createMachine } from 'xstate';

import ImagesRequiredByDocType from '../../constants/images-required-by-doc-type';
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
      predictableActionArguments: true,
      id: 'idScan',
      initial: States.init,
      context: {},
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
            [Events.receivedFrontImage]: [
              {
                target: States.takeOrUploadBackPhoto,
                actions: Actions.assignFrontImage,
                cond: context => {
                  const { type } = context;
                  return type ? !!ImagesRequiredByDocType[type].back : false;
                },
              },
              {
                target: States.processingPhoto,
                actions: Actions.assignFrontImage,
              },
            ],
          },
        },
        [States.takeOrUploadBackPhoto]: {
          on: {
            [Events.receivedBackImage]: {
              target: States.processingPhoto,
              actions: Actions.assignBackImage,
            },
          },
        },
        [States.processingPhoto]: {
          on: {
            [Events.imageSucceeded]: {
              target: States.success,
            },
            [Events.imageErrored]: [
              {
                target: States.retryFrontPhoto,
                actions: [Actions.assignImageErrors],
                cond: (context, event) => !!event.payload.frontImageError,
              },
              {
                target: States.retryBackPhoto,
                actions: [Actions.assignImageErrors],
                cond: (context, event) => !!event.payload.backImageError,
              },
              {
                target: States.failure,
              },
            ],
            [Events.retryLimitExceeded]: {
              target: States.failure,
            },
          },
        },
        [States.retryFrontPhoto]: {
          on: {
            [Events.receivedFrontImage]: [
              {
                target: States.takeOrUploadBackPhoto,
                actions: Actions.assignFrontImage,
                cond: context => !!context.backImageError,
              },
              {
                target: States.processingPhoto,
                actions: Actions.assignFrontImage,
              },
            ],
          },
        },
        [States.retryBackPhoto]: {
          on: {
            [Events.receivedBackImage]: {
              target: States.processingPhoto,
              actions: Actions.assignBackImage,
            },
          },
        },
        [States.success]: {
          type: 'final',
        },
        [States.failure]: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        [Actions.assignContext]: assign((context, event) => {
          if (event.type === Events.receivedContext) {
            const { authToken, device, tenant } = event.payload;
            context.authToken = authToken;
            context.device = { ...device };
            context.tenant = { ...tenant };
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
        [Actions.assignImageErrors]: assign((context, event) => {
          if (event.type === Events.imageErrored) {
            context.frontImageError = event.payload.frontImageError;
            context.backImageError = event.payload.backImageError;
          }
          return context;
        }),
      },
    },
  );

export default createIdScanMachine;
