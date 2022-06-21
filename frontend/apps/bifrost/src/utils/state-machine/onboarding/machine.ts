import { assign, createMachine } from 'xstate';

import createLivenessRegisterMachine from '../liveness-register';
import { DeviceInfo, OnboardingData, TenantInfo } from '../types';
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
  onboarding: OnboardingData;
  device: DeviceInfo;
  tenant: TenantInfo;
  authToken?: string;
};

const createOnboardingMachine = ({
  userFound,
  onboarding,
  device,
  authToken,
  tenant,
}: OnboardingMachineArgs) =>
  createMachine<MachineContext, MachineEvents>(
    {
      id: 'onboarding',
      initial: States.init,
      context: {
        userFound,
        missingAttributes: [...onboarding.missingAttributes],
        missingWebauthnCredentials: onboarding.missingWebauthnCredentials,
        data: onboarding.data || {},
        device,
        authToken,
        tenant,
      },
      states: {
        [States.init]: {
          always: [
            {
              cond: () => userFound && onboarding.missingAttributes.length > 0,
              target: States.additionalDataRequired,
            },
            {
              target: States.livenessRegister,
              cond: context => !userFound && context.missingWebauthnCredentials,
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
              target: States.onboardingSuccess,
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
                target: States.onboardingSuccess,
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
                target: States.onboardingSuccess,
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
                target: States.onboardingSuccess,
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
                target: States.onboardingSuccess,
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
                target: States.onboardingSuccess,
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
        [States.onboardingSuccess]: {
          type: 'final',
        },
      },
    },
    {
      actions: {
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
          context.data.ssn = event.payload.ssn;
          return context;
        }),
      },
    },
  );

export default createOnboardingMachine;
