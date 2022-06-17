import { ChallengeKind } from 'src/utils/state-machine/types';
import { assign, createMachine } from 'xstate';

import createOnboardingMachine from '../onboarding';
import { Actions, BifrostContext, BifrostEvent, Events, States } from './types';

const initialContext: BifrostContext = {
  email: '',
  phone: undefined,
  authToken: undefined,
  userFound: false,
  challenge: undefined,
  device: {
    type: 'mobile',
    hasSupportForWebAuthn: false,
  },
  tenant: {
    pk: '',
    name: '',
    requiredUserData: [],
  },
  onboarding: {
    missingAttributes: [],
    missingWebauthnCredentials: true,
    data: {},
  },
};

const bifrostMachine = createMachine<BifrostContext, BifrostEvent>(
  {
    id: 'bifrostMachine',
    initial: States.emailIdentification,
    context: initialContext,
    on: {
      [Events.deviceInfoIdentified]: {
        actions: [Actions.assignDeviceInfo],
      },
      [Events.tenantInfoIdentified]: {
        actions: [Actions.assignTenantInfo],
      },
    },
    states: {
      [States.emailIdentification]: {
        on: {
          [Events.userIdentifiedByEmail]: {
            description: 'SMS challenge was initiated for the existing user',
            target: States.phoneVerification,
            actions: [
              Actions.assignEmail,
              Actions.assignUserFound,
              Actions.assignChallenge,
            ],
            cond: (context, event) => {
              const { userFound, challengeData } = event.payload;
              return (
                userFound && challengeData?.challengeKind === ChallengeKind.sms
              );
            },
          },
          [Events.userNotIdentified]: {
            description: "Didn't find an account associated with this email",
            target: States.phoneRegistration,
            actions: [
              Actions.assignEmail,
              Actions.assignPhone,
              Actions.assignUserFound,
            ],
          },
          [Events.biometricLoginSucceeded]: [
            {
              target: States.onboarding,
              actions: [
                Actions.assignAuthToken,
                Actions.assignEmail,
                Actions.assignUserFound,
                Actions.assignMissingAttributes,
                Actions.assignMissingWebauthnCredentials,
              ],
              cond: (context, event) =>
                event.payload.missingAttributes.length > 0 ||
                !event.payload.userFound,
            },
            {
              target: States.confirmation,
              actions: [
                Actions.assignAuthToken,
                Actions.assignEmail,
                Actions.assignUserFound,
                Actions.assignMissingAttributes,
                Actions.assignMissingWebauthnCredentials,
              ],
            },
          ],
          [Events.biometricLoginFailed]: {
            target: States.biometricLoginRetry,
            actions: [Actions.assignEmail, Actions.assignUserFound],
          },
        },
      },
      [States.biometricLoginRetry]: {
        on: {
          [Events.biometricLoginSucceeded]: [
            {
              target: States.onboarding,
              actions: [
                Actions.assignAuthToken,
                Actions.assignEmail,
                Actions.assignUserFound,
                Actions.assignMissingAttributes,
                Actions.assignMissingWebauthnCredentials,
              ],
              cond: (context, event) =>
                event.payload.missingAttributes.length > 0 ||
                !event.payload.userFound,
            },
            {
              target: States.confirmation,
              actions: [
                Actions.assignAuthToken,
                Actions.assignEmail,
                Actions.assignUserFound,
                Actions.assignMissingAttributes,
                Actions.assignMissingWebauthnCredentials,
              ],
            },
          ],
          [Events.smsChallengeInitiated]: {
            target: States.phoneVerification,
            actions: [Actions.assignChallenge],
          },
        },
      },
      [States.confirmation]: {
        on: {
          [Events.sharedDataConfirmed]: {
            target: States.verificationSuccess,
          },
        },
      },
      [States.phoneRegistration]: {
        on: {
          [Events.emailChangeRequested]: {
            target: States.emailIdentification,
            actions: [Actions.resetContext],
          },
          [Events.userIdentifiedByPhone]: {
            description:
              'Phone is associated with an existing user, even though the previously typed email was not',
            target: States.phoneVerification,
            actions: [
              Actions.assignPhone,
              Actions.assignUserFound,
              Actions.assignChallenge,
            ],
          },
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
              target: States.onboarding,
              actions: [
                Actions.assignAuthToken,
                Actions.assignMissingAttributes,
                Actions.assignMissingWebauthnCredentials,
              ],
              cond: (context, event) =>
                !context.userFound ||
                event.payload.missingAttributes.length > 0,
            },
            {
              description:
                'Show the confirmation page if there were no missing attributes for existing user',
              target: States.confirmation,
              actions: [
                Actions.assignAuthToken,
                Actions.assignMissingAttributes,
                Actions.assignMissingWebauthnCredentials,
              ],
            },
          ],
        },
      },
      [States.onboarding]: {
        invoke: {
          id: 'onboarding',
          src: context =>
            createOnboardingMachine({
              userFound: context.userFound,
              onboarding: context.onboarding,
              device: context.device,
              authToken: context.authToken,
              tenant: context.tenant,
            }),
          onDone: {
            target: States.onboardingSuccess,
          },
        },
      },
      [States.onboardingSuccess]: {
        type: 'final',
      },
      [States.verificationSuccess]: {
        type: 'final',
      },
    },
  },
  {
    actions: {
      [Actions.assignEmail]: assign((context, event) => {
        if (
          (event.type === Events.userIdentifiedByEmail ||
            event.type === Events.userNotIdentified ||
            event.type === Events.biometricLoginFailed ||
            event.type === Events.biometricLoginSucceeded) &&
          event.payload.email
        ) {
          context.email = event.payload.email;
          context.onboarding.data.email = event.payload.email;
        }
        return context;
      }),
      [Actions.assignPhone]: assign((context, event) => {
        if (
          (event.type === Events.userIdentifiedByPhone ||
            event.type === Events.userNotIdentified) &&
          event.payload.phone
        ) {
          context.phone = event.payload.phone;
        }
        return context;
      }),
      [Actions.resetContext]: assign(context => {
        context.email = '';
        context.phone = undefined;
        context.userFound = false;
        context.authToken = undefined;
        context.challenge = undefined;
        context.onboarding = {
          data: {},
          missingAttributes: [],
          missingWebauthnCredentials: true,
        };
        return context;
      }),
      [Actions.assignUserFound]: assign((context, event) => {
        if (
          event.type === Events.userIdentifiedByPhone ||
          event.type === Events.userIdentifiedByEmail ||
          event.type === Events.userNotIdentified ||
          event.type === Events.biometricLoginFailed ||
          event.type === Events.biometricLoginSucceeded
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
      [Actions.assignDeviceInfo]: assign((context, event) => {
        if (event.type === Events.deviceInfoIdentified) {
          context.device = {
            type: event.payload.type,
            hasSupportForWebAuthn: event.payload.hasSupportForWebAuthn,
          };
        }
        return context;
      }),
      [Actions.assignTenantInfo]: assign((context, event) => {
        if (event.type === Events.tenantInfoIdentified) {
          context.tenant = {
            pk: event.payload.pk,
            name: event.payload.name,
            requiredUserData: [...event.payload.requiredUserData],
          };
        }
        return context;
      }),
      [Actions.assignChallenge]: assign((context, event) => {
        if (
          event.type === Events.userIdentifiedByEmail ||
          event.type === Events.userIdentifiedByPhone ||
          event.type === Events.smsChallengeInitiated ||
          event.type === Events.smsChallengeResent
        ) {
          context.challenge = event.payload.challengeData;
        }
        return context;
      }),
      [Actions.assignMissingAttributes]: assign((context, event) => {
        if (
          event.type === Events.smsChallengeSucceeded ||
          event.type === Events.biometricLoginSucceeded
        ) {
          context.onboarding.missingAttributes = [
            ...event.payload.missingAttributes,
          ];
        }
        return context;
      }),
      [Actions.assignMissingWebauthnCredentials]: assign((context, event) => {
        if (
          event.type === Events.smsChallengeSucceeded ||
          event.type === Events.biometricLoginSucceeded
        ) {
          context.onboarding.missingWebauthnCredentials =
            event.payload.missingWebauthnCredentials;
        }
        return context;
      }),
    },
  },
);

export default bifrostMachine;
