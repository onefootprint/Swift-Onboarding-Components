import { DeviceInfo } from '@onefootprint/hooks';
import { ChallengeKind } from '@onefootprint/types';
import validateBootstrapData from 'src/utils/validate-bootstrap-data';
import { assign, createMachine } from 'xstate';

import { BootstrapData } from '../bifrost/types';
import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';

type IdentifyMachineArgs = {
  device: DeviceInfo;
  bootstrapData?: BootstrapData;
  tenantPk?: string;
};

const createIdentifyMachine = ({
  device,
  bootstrapData,
  tenantPk,
}: IdentifyMachineArgs) =>
  createMachine<MachineContext, MachineEvents>(
    {
      predictableActionArguments: true,
      id: 'identify',
      initial: bootstrapData
        ? States.processBootstrapData
        : States.emailIdentification,
      context: {
        device,
        bootstrapData: bootstrapData ?? {},
        tenantPk,
      },
      states: {
        [States.processBootstrapData]: {
          entry: [Actions.assignBootstrapData],
          on: {
            [Events.bootstrapDataProcessed]: {
              target: States.phoneVerification,
              actions: [Actions.assignChallenge, Actions.assignUserFound],
            },
            [Events.bootstrapDataProcessErrored]: {
              target: States.emailIdentification,
            },
          },
        },
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
            [Events.navigatedToPrevPage]: {
              target: States.emailIdentification,
            },
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
            userFound: (context: MachineContext) => context.userFound,
            email: (context: MachineContext) => context.email,
          },
        },
      },
    },
    {
      actions: {
        [Actions.assignBootstrapData]: assign(context => {
          const { email, phoneNumber } = validateBootstrapData(
            context.bootstrapData,
          );
          context.phone = phoneNumber;
          context.email = email;
          return context;
        }),
        [Actions.assignEmail]: assign((context, event) => {
          if (event.type === Events.emailIdentificationCompleted) {
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
            event.type === Events.phoneIdentificationCompleted ||
            event.type === Events.bootstrapDataProcessed
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
            event.type !== Events.bootstrapDataProcessed &&
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
