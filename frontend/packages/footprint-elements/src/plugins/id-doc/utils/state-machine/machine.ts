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
              target: States.idDocFrontImage,
              actions: Actions.assignIdDocCountryAndType,
            },
          },
        },
        [States.idDocFrontImage]: {
          on: {
            [Events.receivedIdDocFrontImage]: [
              {
                target: States.idDocBackImage,
                actions: Actions.assignIdDocFrontImage,
                cond: context => {
                  const {
                    idDoc: { type },
                  } = context;
                  return type ? !!ImagesRequiredByIdDocType[type].back : false;
                },
              },
              {
                target: States.selfiePrompt,
                cond: context => !!context.selfie.required,
                actions: Actions.assignIdDocFrontImage,
              },
              {
                target: States.processingDocuments,
                actions: Actions.assignIdDocFrontImage,
              },
            ],
          },
        },
        [States.idDocBackImage]: {
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
            [Events.consentReceived]: {
              actions: [Actions.assignConsent],
            },
            [Events.startSelfieCapture]: {
              target: States.selfieImage,
            },
          },
        },
        [States.selfieImage]: {
          on: {
            [Events.cameraErrored]: {
              target: States.selfiePrompt,
            },
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
                target: States.error,
                actions: Actions.assignIdDocImageErrors,
              },
            ],
            [Events.retryLimitExceeded]: {
              target: States.failure,
            },
          },
        },
        [States.error]: {
          on: {
            [Events.resubmitIdDocImages]: {
              target: States.idDocFrontImage,
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
              consentRequired,
            } = event.payload;
            context.authToken = authToken;
            context.device = { ...device };
            context.requestId = requestId;
            context.idDoc.required = idDocRequired;
            context.selfie.required = selfieRequired;
            context.selfie.consentRequired = consentRequired;
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
        [Actions.assignConsent]: assign((context, event) => {
          if (event.type === Events.consentReceived) {
            context.selfie.consentRequired = false;
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
            context.idDoc.errors = event.payload.errors;
            context.idDoc.frontImage = undefined;
            context.idDoc.backImage = undefined;
          }
          return context;
        }),
      },
    },
  );

export default createIdDocMachine;
