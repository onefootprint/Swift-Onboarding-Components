import { DeviceInfo } from 'hooks';
import { assign, createMachine } from 'xstate';

import createLivenessRegisterMachine from '../liveness-register';
import { TenantInfo } from '../types';
import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';
import {
  hasMissingAttributes,
  isMissingBasicAttribute,
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
} from './utils/missing-attributes';

export type OnboardingMachineArgs = {
  userFound: boolean;
  device: DeviceInfo;
  tenant: TenantInfo;
  authToken?: string;
};

const createOnboardingMachine = ({
  userFound,
  device,
  authToken,
  tenant,
}: OnboardingMachineArgs) =>
  createMachine<MachineContext, MachineEvents>(
    {
      predictableActionArguments: true,
      id: 'onboarding',
      initial: States.onboardingVerification,
      context: {
        userFound,
        missingAttributes: [],
        missingWebauthnCredentials: false,
        data: {},
        device,
        authToken,
        tenant,
      },
      states: {
        [States.onboardingVerification]: {
          on: {
            [Events.onboardingVerificationCompleted]: [
              {
                target: States.onboardingComplete,
                cond: (context, event) => !!event.payload.validationToken,
                actions: [
                  Actions.assignValidationToken,
                  Actions.assignMissingAttributes,
                  Actions.assignMissingWebauthnCredentials,
                ],
              },
              {
                target: States.initOnboarding,
                actions: [
                  Actions.assignValidationToken,
                  Actions.assignMissingAttributes,
                  Actions.assignMissingWebauthnCredentials,
                ],
              },
            ],
          },
        },
        [States.initOnboarding]: {
          always: [
            {
              cond: context =>
                userFound &&
                (context.missingAttributes.length > 0 ||
                  context.missingWebauthnCredentials),
              target: States.additionalDataRequired,
            },
            {
              target: States.livenessRegister,
              cond: context => context.missingWebauthnCredentials,
            },
            {
              target: States.basicInformation,
              cond: context =>
                !userFound ||
                isMissingBasicAttribute(
                  context.missingAttributes,
                  context.data,
                ),
            },
            {
              target: States.residentialAddress,
              cond: context =>
                isMissingResidentialAttribute(
                  context.missingAttributes,
                  context.data,
                ),
            },
            {
              target: States.ssn,
              cond: context =>
                isMissingSsnAttribute(context.missingAttributes, context.data),
            },
            {
              target: States.onboardingComplete,
            },
          ],
        },
        [States.additionalDataRequired]: {
          on: {
            [Events.additionalInfoRequired]: [
              {
                target: States.livenessRegister,
                description:
                  'If there are other attributes missing in addition to webauthn for an existing user, take them to liveness register, since the user likely abandoned onboarding early.',
                cond: context =>
                  userFound &&
                  context.missingWebauthnCredentials &&
                  hasMissingAttributes(context.missingAttributes, context.data),
              },
              {
                target: States.basicInformation,
                cond: context =>
                  isMissingBasicAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.residentialAddress,
                cond: context =>
                  isMissingResidentialAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.ssn,
                cond: context =>
                  isMissingSsnAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.onboardingComplete,
              },
            ],
          },
        },
        [States.livenessRegister]: {
          invoke: {
            id: 'livenessRegister',
            src: context =>
              createLivenessRegisterMachine({
                device: context.device,
                authToken: context.authToken,
              }),
            onDone: [
              {
                target: States.basicInformation,
                cond: context =>
                  isMissingBasicAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.residentialAddress,
                cond: context =>
                  isMissingResidentialAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.ssn,
                cond: context =>
                  isMissingSsnAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.onboardingComplete,
              },
            ],
          },
        },
        [States.basicInformation]: {
          on: {
            [Events.basicInformationSubmitted]: [
              {
                target: States.residentialAddress,
                actions: [Actions.assignBasicInformation],
                cond: context =>
                  isMissingResidentialAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.ssn,
                actions: [Actions.assignBasicInformation],
                cond: context =>
                  isMissingSsnAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.onboardingComplete,
                actions: [Actions.assignBasicInformation],
              },
            ],
          },
        },
        [States.residentialAddress]: {
          on: {
            [Events.residentialAddressSubmitted]: [
              {
                target: States.ssn,
                actions: [Actions.assignResidentialAddress],
                cond: context =>
                  isMissingSsnAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.onboardingComplete,
                actions: [Actions.assignResidentialAddress],
              },
            ],
            [Events.navigatedToPrevPage]: [
              {
                target: States.basicInformation,
                cond: context =>
                  isMissingBasicAttribute(context.missingAttributes),
              },
            ],
          },
        },
        [States.ssn]: {
          on: {
            [Events.ssnSubmitted]: [
              {
                target: States.onboardingComplete,
                actions: [Actions.assignSsn],
              },
            ],
            [Events.navigatedToPrevPage]: [
              {
                target: States.residentialAddress,
                cond: context =>
                  isMissingResidentialAttribute(context.missingAttributes),
              },
              {
                target: States.basicInformation,
                cond: context =>
                  isMissingBasicAttribute(context.missingAttributes),
              },
            ],
          },
        },
        [States.onboardingComplete]: {
          type: 'final',
          data: {
            onboardingData: (context: MachineContext) => context.data,
            missingWebauthnCredentials: (context: MachineContext) =>
              context.missingWebauthnCredentials,
            missingAttributes: (context: MachineContext) =>
              context.missingAttributes,
            validationToken: (context: MachineContext) =>
              context.validationToken,
          },
        },
      },
    },
    {
      actions: {
        [Actions.assignMissingAttributes]: assign((context, event) => {
          if (event.type === Events.onboardingVerificationCompleted) {
            context.missingAttributes = [...event.payload.missingAttributes];
          }
          return context;
        }),
        [Actions.assignMissingWebauthnCredentials]: assign((context, event) => {
          if (event.type === Events.onboardingVerificationCompleted) {
            context.missingWebauthnCredentials =
              event.payload.missingWebauthnCredentials;
          }
          return context;
        }),
        [Actions.assignValidationToken]: assign((context, event) => {
          if (event.type === Events.onboardingVerificationCompleted) {
            context.validationToken = event.payload.validationToken;
          }
          return context;
        }),
        [Actions.assignBasicInformation]: assign((context, event) => {
          if (event.type === Events.basicInformationSubmitted) {
            context.data = {
              ...context.data,
              ...event.payload.basicInformation,
            };
          }
          return context;
        }),
        [Actions.assignResidentialAddress]: assign((context, event) => {
          if (event.type === Events.residentialAddressSubmitted) {
            context.data = {
              ...context.data,
              ...event.payload.residentialAddress,
            };
          }
          return context;
        }),
        [Actions.assignSsn]: assign((context, event) => {
          if (event.type !== Events.ssnSubmitted) {
            return context;
          }
          context.data = {
            ...context.data,
            ...event.payload,
          };

          return context;
        }),
      },
    },
  );

export default createOnboardingMachine;
