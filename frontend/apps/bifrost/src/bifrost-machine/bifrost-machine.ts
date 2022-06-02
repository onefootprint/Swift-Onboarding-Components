import { assign, createMachine } from 'xstate';

import {
  Actions,
  BifrostContext,
  BifrostEvent,
  ChallengeKind,
  Events,
  States,
} from './types';
import {
  hasMissingAttributes,
  isMissingBasicAttribute,
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
} from './utils/missing-attributes';

const initialContext = {
  email: '',
  phone: undefined,
  authToken: undefined,
  userFound: false,
  challenge: undefined,
  onboarding: {
    missingAttributes: [],
    data: {},
    missingWebauthnCredentials: true,
  },
};

const bifrostMachine = createMachine<BifrostContext, BifrostEvent>(
  {
    id: 'bifrostMachine',
    initial: States.emailIdentification,
    context: initialContext,
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
          [Events.smsChallengeResent]: [
            {
              actions: [Actions.assignChallenge],
            },
          ],
          [Events.challengeSucceeded]: [
            {
              description:
                'Show the verification success page if there were no missing attributes for existing user',
              target: States.verificationSuccess,
              actions: [
                Actions.assignAuthToken,
                Actions.assignMissingAttributes,
                Actions.assignMissingWebauthnCredentials,
              ],
              cond: (context, event) =>
                context.userFound &&
                event.payload.missingAttributes.length === 0,
            },
            {
              description:
                'For an existing user, show the intermediate additionalDataRequired page before the onboarding pages',
              target: States.additionalDataRequired,
              actions: [
                Actions.assignAuthToken,
                Actions.assignMissingAttributes,
                Actions.assignMissingWebauthnCredentials,
              ],
              cond: (context, event) =>
                context.userFound &&
                hasMissingAttributes(
                  event.payload.missingAttributes,
                  context.onboarding.data,
                ),
            },
            {
              target: States.basicInformation,
              actions: [
                Actions.assignAuthToken,
                Actions.assignMissingAttributes,
                Actions.assignMissingWebauthnCredentials,
              ],
              cond: (context, event) =>
                !context.userFound &&
                isMissingBasicAttribute(
                  event.payload.missingAttributes,
                  context.onboarding.data,
                ),
            },
            {
              target: States.residentialAddress,
              actions: [
                Actions.assignAuthToken,
                Actions.assignMissingAttributes,
                Actions.assignMissingWebauthnCredentials,
              ],
              cond: (context, event) =>
                !context.userFound &&
                isMissingResidentialAttribute(
                  event.payload.missingAttributes,
                  context.onboarding.data,
                ),
            },
            {
              target: States.ssn,
              actions: [
                Actions.assignAuthToken,
                Actions.assignMissingAttributes,
                Actions.assignMissingWebauthnCredentials,
              ],
              cond: (context, event) =>
                !context.userFound &&
                isMissingSsnAttribute(
                  event.payload.missingAttributes,
                  context.onboarding.data,
                ),
            },
            {
              description:
                "For completeness only. If the new user doesn't have missing attributes, take them to onboarding success directly",
              target: States.onboardingSuccess,
              actions: [
                Actions.assignAuthToken,
                Actions.assignMissingAttributes,
                Actions.assignMissingWebauthnCredentials,
              ],
              cond: (context, event) =>
                !context.userFound &&
                event.payload.missingAttributes.length === 0,
            },
          ],
        },
      },
      [States.additionalDataRequired]: {
        on: {
          [Events.additionalInfoRequired]: [
            {
              target: States.basicInformation,
              cond: context =>
                isMissingBasicAttribute(
                  context.onboarding.missingAttributes,
                  context.onboarding.data,
                ),
            },
            {
              target: States.residentialAddress,
              cond: context =>
                isMissingResidentialAttribute(
                  context.onboarding.missingAttributes,
                  context.onboarding.data,
                ),
            },
            {
              target: States.ssn,
              cond: context =>
                isMissingSsnAttribute(
                  context.onboarding.missingAttributes,
                  context.onboarding.data,
                ),
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
                  context.onboarding.missingAttributes,
                  context.onboarding.data,
                ),
            },
            {
              target: States.ssn,
              actions: [Actions.assignBasicInformation],
              cond: context =>
                isMissingSsnAttribute(
                  context.onboarding.missingAttributes,
                  context.onboarding.data,
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
                  context.onboarding.missingAttributes,
                  context.onboarding.data,
                ),
            },
            {
              target: States.onboardingSuccess,
              actions: [Actions.assignResidentialAddress],
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
            event.type === Events.userNotIdentified) &&
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
          event.type === Events.userNotIdentified
        ) {
          context.userFound = event.payload.userFound;
        }
        return context;
      }),
      [Actions.assignAuthToken]: assign((context, event) => {
        if (event.type === Events.challengeSucceeded) {
          context.authToken = event.payload.authToken;
        }
        return context;
      }),
      [Actions.assignChallenge]: assign((context, event) => {
        if (
          event.type === Events.userIdentifiedByEmail ||
          event.type === Events.userIdentifiedByPhone
        ) {
          context.challenge = event.payload.challengeData;
        }
        return context;
      }),
      [Actions.assignMissingAttributes]: assign((context, event) => {
        if (event.type === Events.challengeSucceeded) {
          context.onboarding.missingAttributes = [
            ...event.payload.missingAttributes,
          ];
        }
        return context;
      }),
      [Actions.assignMissingWebauthnCredentials]: assign((context, event) => {
        if (event.type === Events.challengeSucceeded) {
          context.onboarding.missingWebauthnCredentials =
            event.payload.missingWebauthnCredentials;
        }
        return context;
      }),
      [Actions.assignBasicInformation]: assign((context, event) => {
        if (event.type === Events.basicInformationSubmitted) {
          context.onboarding.data = {
            ...context.onboarding.data,
            ...event.payload.basicInformation,
          };
        }
        return context;
      }),
      [Actions.assignResidentialAddress]: assign((context, event) => {
        if (event.type === Events.residentialAddressSubmitted) {
          context.onboarding.data = {
            ...context.onboarding.data,
            ...event.payload.residentialAddress,
          };
        }
        return context;
      }),
      [Actions.assignSsn]: assign((context, event) => {
        if (event.type !== Events.ssnSubmitted) {
          return context;
        }
        context.onboarding.data.ssn = event.payload.ssn;
        return context;
      }),
    },
  },
);

export default bifrostMachine;
