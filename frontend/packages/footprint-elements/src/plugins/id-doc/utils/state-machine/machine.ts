import { assign, createMachine } from 'xstate';

import ImagesRequiredByIdDocType from '../../constants/images-required-by-id-doc-type';
import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';

const createIdDocMachine = () =>
  createMachine<MachineContext, MachineEvents>(
    {
      predictableActionArguments: true,
      id: 'idDoc',
      initial: States.init,
      context: {
        idDoc: {},
        selfie: {},
      },
      states: {
        [States.init]: {
          on: {
            [Events.receivedContext]: [
              {
                target: States.idDocCountryAndType,
                actions: Actions.assignContext,
                cond: (context, event) => !!event.payload.idDocRequired,
              },
              {
                target: States.selfiePrompt,
                actions: Actions.assignContext,
                cond: (context, event) => !!event.payload.selfieRequired,
              },
              {
                target: States.success,
              },
            ],
          },
        },
        [States.idDocCountryAndType]: {
          on: {
            [Events.idDocCountryAndTypeSelected]: {
              target: States.idDocFrontPhoto,
              actions: Actions.assignIdDocCountryAndType,
            },
          },
        },
        [States.idDocFrontPhoto]: {
          on: {
            [Events.receivedIdDocFrontImage]: [
              {
                target: States.idDocBackPhoto,
                actions: Actions.assignIdDocFrontImage,
                cond: context => {
                  const {
                    idDoc: { type },
                  } = context;
                  return type ? !!ImagesRequiredByIdDocType[type].back : false;
                },
              },
              {
                target: States.processingDocuments,
                actions: Actions.assignIdDocFrontImage,
              },
            ],
          },
        },
        [States.idDocBackPhoto]: {
          on: {
            [Events.receivedIdDocBackImage]: [
              {
                target: States.selfiePrompt,
                cond: context => !!context.selfie.required,
                actions: Actions.assignIdDocBackImage,
              },
              {
                target: States.processingDocuments,
                actions: Actions.assignIdDocBackImage,
              },
            ],
          },
        },
        [States.selfiePrompt]: {
          on: {
            [Events.startSelfieCapture]: {
              target: States.selfiePhoto,
            },
          },
        },
        [States.selfiePhoto]: {
          on: {
            [Events.receivedSelfieImage]: {
              target: States.processingDocuments,
              actions: Actions.assignSelfie,
            },
          },
        },
        [States.processingDocuments]: {
          on: {
            [Events.succeeded]: {
              target: States.success,
            },
            [Events.errored]: [
              {
                target: States.retryIdDocFrontPhoto,
                actions: Actions.assignIdDocImageErrors,
                cond: (context, event) => !!event.payload.idDocFrontImageError,
              },
              {
                target: States.retryIdDocBackPhoto,
                actions: Actions.assignIdDocImageErrors,
                cond: (context, event) => !!event.payload.idDocBackImageError,
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
        [States.retryIdDocFrontPhoto]: {
          on: {
            [Events.receivedIdDocFrontImage]: [
              {
                target: States.idDocBackPhoto,
                actions: Actions.assignIdDocFrontImage,
                cond: context => !!context.idDoc.backImageError,
              },
              {
                target: States.processingDocuments,
                actions: Actions.assignIdDocFrontImage,
              },
            ],
          },
        },
        [States.retryIdDocBackPhoto]: {
          on: {
            [Events.receivedIdDocBackImage]: {
              target: States.processingDocuments,
              actions: Actions.assignIdDocBackImage,
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
            const {
              authToken,
              device,
              requestId,
              idDocRequired,
              selfieRequired,
            } = event.payload;
            context.authToken = authToken;
            context.device = { ...device };
            context.requestId = requestId;
            context.idDoc.required = idDocRequired;
            context.selfie.required = selfieRequired;
          }
          return context;
        }),
        [Actions.assignIdDocCountryAndType]: assign((context, event) => {
          if (event.type === Events.idDocCountryAndTypeSelected) {
            context.idDoc.type = event.payload.type;
            context.idDoc.country = event.payload.country;
          }
          return context;
        }),
        [Actions.assignIdDocFrontImage]: assign((context, event) => {
          if (event.type === Events.receivedIdDocFrontImage) {
            context.idDoc.frontImage = event.payload.image;
          }
          return context;
        }),
        [Actions.assignIdDocBackImage]: assign((context, event) => {
          if (event.type === Events.receivedIdDocBackImage) {
            context.idDoc.backImage = event.payload.image;
          }
          return context;
        }),
        [Actions.assignSelfie]: assign((context, event) => {
          if (event.type === Events.receivedSelfieImage) {
            context.selfie.image = event.payload.image;
          }
          return context;
        }),
        [Actions.assignIdDocImageErrors]: assign((context, event) => {
          if (event.type === Events.errored) {
            context.idDoc.frontImageError = event.payload.idDocFrontImageError;
            context.idDoc.backImageError = event.payload.idDocBackImageError;
          }
          return context;
        }),
      },
    },
  );

export default createIdDocMachine;
