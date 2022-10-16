import { DeviceInfo } from '@onefootprint/hooks';
import { ChallengeKind, IdentifyType } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';

type IdentifyMachineArgs = {
  identifyType: IdentifyType;
  device: DeviceInfo;
};

const createIdentifyMachine = ({ identifyType, device }: IdentifyMachineArgs) =>
  createMachine<MachineContext, MachineEvents>(
    {
      predictableActionArguments: true,
      id: 'identify',
      initial: States.emailIdentification,
      context: {
        device,
        identifyType,
      },
      states: {
        [States.emailIdentification]: {
          on: {
            [Events.emailIdentificationCompleted]: [
              {
                target: States.phoneRegistration,
                actions: [Actions.assignEmail, Actions.assignUserFound],
                cond: (context, event) => !event.payload.userFound,
              },
              {
                target: States.phoneVerification,
                actions: [
                  Actions.assignEmail,
                  Actions.assignUserFound,
                  Actions.assignChallenge,
                ],
                cond: (context, event) =>
                  event.payload.userFound &&
                  event.payload.challengeData?.challengeKind ===
                    ChallengeKind.sms,
              },
              {
                actions: [
                  Actions.assignEmail,
                  Actions.assignUserFound,
                  Actions.assignChallenge,
                ],
              },
            ],
            [Events.biometricLoginSucceeded]: [
              {
                target: States.success,
                actions: [Actions.assignAuthToken],
              },
            ],
            [Events.biometricLoginFailed]: [
              {
                target: States.biometricLoginRetry,
              },
            ],
          },
        },
        [States.phoneRegistration]: {
          on: {
            [Events.emailChangeRequested]: [
              {
                target: States.emailIdentification,
                actions: [Actions.resetContext],
              },
            ],
            [Events.phoneIdentificationCompleted]: [
              {
                target: States.phoneVerification,
                actions: [
                  Actions.assignPhone,
                  Actions.assignEmail,
                  Actions.assignUserFound,
                  Actions.assignChallenge,
                ],
              },
            ],
          },
        },
        [States.phoneVerification]: {
          on: {
            [Events.navigatedToPrevPage]: [
              {
                target: States.phoneRegistration,
                cond: context => !context.userFound || !!context.phone,
              },
              {
                target: States.emailIdentification,
              },
            ],
            [Events.smsChallengeResent]: [
              {
                actions: [Actions.assignChallenge],
              },
            ],
            [Events.smsChallengeSucceeded]: [
              {
                target: States.success,
                actions: [Actions.assignAuthToken],
              },
            ],
          },
        },
        [States.biometricLoginRetry]: {
          on: {
            [Events.biometricLoginSucceeded]: [
              {
                target: States.success,
                actions: [Actions.assignAuthToken],
              },
            ],
            [Events.smsChallengeInitiated]: [
              {
                target: States.phoneVerification,
                actions: [Actions.assignChallenge],
              },
            ],
          },
        },
        [States.success]: {
          type: 'final',
          data: {
            authToken: (context: MachineContext) => context.authToken,
            email: (context: MachineContext) => context.email,
            phone: (context: MachineContext) => context.phone,
            userFound: (context: MachineContext) => context.userFound,
          },
        },
      },
    },
    {
      actions: {
        [Actions.assignEmail]: assign((context, event) => {
          if (
            (event.type === Events.emailIdentificationCompleted ||
              event.type === Events.phoneIdentificationCompleted) &&
            event.payload.email
          ) {
            context.email = event.payload.email;
          }
          return context;
        }),
        [Actions.assignPhone]: assign((context, event) => {
          if (
            event.type === Events.phoneIdentificationCompleted &&
            event.payload.phone
          ) {
            context.phone = event.payload.phone;
          }
          return context;
        }),
        [Actions.assignUserFound]: assign((context, event) => {
          if (
            event.type === Events.emailIdentificationCompleted ||
            event.type === Events.phoneIdentificationCompleted
          ) {
            context.userFound = event.payload.userFound;
          }
          return context;
        }),
        [Actions.assignAuthToken]: assign((context, event) => {
          if (
            event.type === Events.smsChallengeSucceeded ||
            event.type === Events.biometricLoginSucceeded
          ) {
            context.authToken = event.payload.authToken;
          }
          return context;
        }),
        [Actions.resetContext]: assign(context => {
          context.email = undefined;
          context.phone = undefined;
          context.userFound = false;
          context.authToken = undefined;
          context.challengeData = undefined;
          return context;
        }),
        [Actions.assignChallenge]: assign((context, event) => {
          if (
            event.type !== Events.emailIdentificationCompleted &&
            event.type !== Events.phoneIdentificationCompleted &&
            event.type !== Events.smsChallengeInitiated &&
            event.type !== Events.smsChallengeResent
          ) {
            return context;
          }
          const { challengeData } = event.payload;
          if (!challengeData) {
            return context;
          }
          context.challengeData = { ...challengeData };
          return context;
        }),
      },
    },
  );

export default createIdentifyMachine;
