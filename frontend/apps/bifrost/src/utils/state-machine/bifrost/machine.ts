import { IdentifyType } from 'types';
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
    hasSupportForWebauthn: false,
  },
  tenant: {
    canAccessData: [],
    isLive: false,
    mustCollectData: [],
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
    predictableActionArguments: true,
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
              target: States.onboarding,
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
      [States.onboarding]: {
        invoke: {
          id: 'onboarding',
          src: context =>
            createOnboardingMachine({
              userFound: context.userFound,
              device: context.device,
              authToken: context.authToken,
              tenant: context.tenant,
            }),
          onDone: [
            // TODO: uncomment when we start using multiple config keys in demos
            // https://linear.app/footprint/issue/FP-991/start-using-multiple-config-keys-one-per-demo-tenant-in-demos
            // {
            //   target: States.verificationSuccess,
            //   actions: [
            //     Actions.assignOnboardingData,
            //     Actions.assignValidationToken,
            //     Actions.assignMissingWebauthnCredentials,
            //     Actions.assignMissingAttributes,
            //   ],
            //   description:
            //     'If validation token exists, it means the user has already filled this onboarding config for the tenant, so we can take a shortcut here',
            //   cond: (context, event) => !!event.data.validationToken,
            // },
            {
              target: States.confirmAndAuthorize,
              actions: [
                Actions.assignOnboardingData,
                Actions.assignValidationToken,
                Actions.assignMissingWebauthnCredentials,
                Actions.assignMissingAttributes,
              ],
            },
          ],
        },
      },
      [States.confirmAndAuthorize]: {
        on: {
          [Events.sharedDataConfirmed]: [
            // TODO: uncomment when we start using multiple config keys in demos
            // Replace this with the onboardingSuccess one below
            // https://linear.app/footprint/issue/FP-991/start-using-multiple-config-keys-one-per-demo-tenant-in-demos
            // {
            //   target: States.onboardingSuccess,
            //   actions: [Actions.assignValidationToken],
            //   cond: (context, event) => !event.payload.validationToken,
            // },
            {
              target: States.onboardingSuccess,
              cond: context =>
                !context.userFound ||
                context.onboarding.missingAttributes.length > 0,
              actions: [Actions.assignValidationToken],
            },
            {
              target: States.verificationSuccess,
              actions: [Actions.assignValidationToken],
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
            hasSupportForWebauthn: event.payload.hasSupportForWebauthn,
          };
        }
        return context;
      }),
      [Actions.assignTenantInfo]: assign((context, event) => {
        if (event.type === Events.tenantInfoRequestSucceeded) {
          context.tenant = {
            canAccessData: [...event.payload.canAccessData],
            isLive: event.payload.isLive,
            mustCollectData: [...event.payload.mustCollectData],
            name: event.payload.name,
            orgName: event.payload.orgName,
            pk: event.payload.pk,
          };
        }
        return context;
      }),
      [Actions.assignValidationToken]: assign((context, event) => {
        if (event.type === Events.sharedDataConfirmed) {
          context.onboarding.validationToken = event.payload.validationToken;
        }
        if (event.type === Events.onboardingCompleted) {
          context.onboarding.validationToken = event.data.validationToken;
        }
        return context;
      }),
      [Actions.assignOnboardingData]: assign((context, event) => {
        if (event.type === Events.onboardingCompleted) {
          context.onboarding.data = { ...event.data.onboardingData };
        }
        return context;
      }),
      [Actions.assignMissingWebauthnCredentials]: assign((context, event) => {
        if (event.type === Events.onboardingCompleted) {
          context.onboarding.missingWebauthnCredentials =
            event.data.missingWebauthnCredentials;
        }
        return context;
      }),
      [Actions.assignMissingAttributes]: assign((context, event) => {
        if (event.type === Events.onboardingCompleted) {
          context.onboarding.missingAttributes = [
            ...event.data.missingAttributes,
          ];
        }
        return context;
      }),
    },
  },
);

export default bifrostMachine;
