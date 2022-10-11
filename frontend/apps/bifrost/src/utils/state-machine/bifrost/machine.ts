import { IdentifyType } from '@onefootprint/types';
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
              target: States.onboarding,
              actions: [
                Actions.assignAuthToken,
                Actions.assignEmail,
                Actions.assignPhone,
                Actions.assignUserFound,
              ],
              cond: context =>
                !!context.tenant &&
                context.identifyType === IdentifyType.onboarding,
            },
            {
              target: States.authenticationSuccess,
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
              tenant: context.tenant!,
            }),
          onDone: [
            {
              target: States.onboardingSuccess,
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
      // TODO: when do we go to verification success
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
        if (event.type === Events.onboardingCompleted) {
          context.validationToken = event.data.validationToken;
        }
        return context;
      }),
    },
  },
);

export default bifrostMachine;
