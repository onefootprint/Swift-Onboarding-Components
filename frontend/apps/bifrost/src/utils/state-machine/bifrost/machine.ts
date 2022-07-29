import { IdentifyType } from 'src/utils/state-machine/types';
import { assign, createMachine } from 'xstate';

import createIdentifyMachine from '../identify';
import createOnboardingMachine from '../onboarding';
import { Actions, BifrostContext, BifrostEvent, Events, States } from './types';

const initialContext: BifrostContext = {
  identifyType: IdentifyType.onboarding,
  email: '',
  phone: undefined,
  authToken: undefined,
  userFound: false,
  device: {
    type: 'mobile',
    hasSupportForWebAuthn: false,
  },
  tenant: {
    canAccessDataKinds: [],
    isLive: undefined,
    mustCollectDataKinds: [],
    name: '',
    orgName: '',
    pk: '',
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
    initial: States.init,
    context: initialContext,
    states: {
      [States.init]: {
        on: {
          [Events.deviceInfoIdentified]: {
            actions: [Actions.assignDeviceInfo],
          },
          [Events.authenticationFlowStarted]: {
            target: States.identify,
            actions: [Actions.assignIdentifyType],
          },
          [Events.tenantInfoRequestSucceeded]: {
            target: States.identify,
            actions: [Actions.assignTenantInfo],
          },
          [Events.tenantInfoRequestFailed]: {
            target: States.tenantInvalid,
          },
        },
      },
      [States.identify]: {
        invoke: {
          id: 'identify',
          src: context =>
            createIdentifyMachine({
              device: { ...context.device },
              identifyType: context.identifyType,
            }),
          onDone: [
            {
              target: States.authenticationSuccess,
              actions: [
                Actions.assignAuthToken,
                Actions.assignEmail,
                Actions.assignPhone,
                Actions.assignUserFound,
              ],
              cond: context => context.identifyType === IdentifyType.my1fp,
            },
            {
              target: States.onboardingVerification,
              actions: [
                Actions.assignAuthToken,
                Actions.assignEmail,
                Actions.assignPhone,
                Actions.assignUserFound,
              ],
            },
          ],
        },
      },
      [States.onboardingVerification]: {
        on: {
          [Events.onboardingVerificationSucceeded]: [
            {
              target: States.onboarding,
              actions: [
                Actions.assignMissingAttributes,
                Actions.assignMissingWebauthnCredentials,
              ],

              cond: (context, event) =>
                !context.userFound ||
                event.payload.missingAttributes.length > 0,
            },
            {
              target: States.confirmAndAuthorize,
              actions: [
                Actions.assignMissingAttributes,
                Actions.assignMissingWebauthnCredentials,
              ],
              cond: context => context.tenant.canAccessDataKinds.length > 0,
            },
            {
              actions: [
                Actions.assignMissingAttributes,
                Actions.assignMissingWebauthnCredentials,
              ],
              target: States.verificationSuccess,
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
            target: States.confirmAndAuthorize,
          },
        },
      },
      [States.confirmAndAuthorize]: {
        on: {
          [Events.sharedDataConfirmed]: [
            {
              target: States.verificationSuccess,
              cond: context =>
                context.userFound &&
                context.onboarding.missingAttributes.length === 0,
            },
            {
              target: States.onboardingSuccess,
            },
          ],
        },
      },
      [States.tenantInvalid]: {
        type: 'final',
      },
      [States.authenticationSuccess]: {
        type: 'final',
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
      [Actions.assignIdentifyType]: assign((context, event) => {
        if (event.type === Events.authenticationFlowStarted) {
          context.identifyType = IdentifyType.my1fp;
        }
        return context;
      }),
      [Actions.assignEmail]: assign((context, event) => {
        if (event.type === Events.identifyCompleted && event.data.email) {
          context.email = event.data.email;
          context.onboarding.data.email = event.data.email;
        }
        return context;
      }),
      [Actions.assignPhone]: assign((context, event) => {
        if (event.type === Events.identifyCompleted && event.data.phone) {
          context.phone = event.data.phone;
        }
        return context;
      }),
      [Actions.assignUserFound]: assign((context, event) => {
        if (event.type === Events.identifyCompleted) {
          context.userFound = event.data.userFound;
        }
        return context;
      }),
      [Actions.assignAuthToken]: assign((context, event) => {
        if (event.type === Events.identifyCompleted) {
          context.authToken = event.data.authToken;
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
        if (event.type === Events.tenantInfoRequestSucceeded) {
          context.tenant = {
            canAccessDataKinds: [...event.payload.canAccessDataKinds],
            isLive: event.payload.isLive,
            mustCollectDataKinds: [...event.payload.mustCollectDataKinds],
            name: event.payload.name,
            orgName: event.payload.orgName,
            pk: event.payload.pk,
          };
        }
        return context;
      }),
      [Actions.assignMissingAttributes]: assign((context, event) => {
        if (event.type === Events.onboardingVerificationSucceeded) {
          context.onboarding.missingAttributes = [
            ...event.payload.missingAttributes,
          ];
        }
        return context;
      }),
      [Actions.assignMissingWebauthnCredentials]: assign((context, event) => {
        if (event.type === Events.onboardingVerificationSucceeded) {
          context.onboarding.missingWebauthnCredentials =
            event.payload.missingWebauthnCredentials;
        }
        return context;
      }),
    },
  },
);

export default bifrostMachine;
