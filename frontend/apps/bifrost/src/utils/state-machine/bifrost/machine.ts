import { assign, createMachine } from 'xstate';

import createIdentifyMachine from '../identify';
import createOnboardingMachine from '../onboarding';
import { Actions, BifrostContext, BifrostEvent, Events, States } from './types';
import initContextComplete from './utils/init-context-complete';

const bifrostMachine = createMachine<BifrostContext, BifrostEvent>(
  {
    predictableActionArguments: true,
    id: 'bifrostMachine',
    initial: States.init,
    context: {},
    on: {
      [Events.reset]: {
        target: States.init,
        actions: [Actions.resetContext],
      },
    },
    states: {
      [States.init]: {
        on: {
          [Events.configRequestFailed]: {
            target: States.configInvalid,
          },
          [Events.initContextUpdated]: [
            {
              description:
                'Only transition to next state if all required info is collected',
              actions: [Actions.assignInitContext],
              target: States.identify,
              cond: (context, event) => initContextComplete(context, event),
            },
            {
              actions: [Actions.assignInitContext],
            },
          ],
        },
      },
      [States.identify]: {
        invoke: {
          id: 'identify',
          src: context =>
            createIdentifyMachine({
              device: { ...context.device! },
              bootstrapData: context.bootstrapData ?? {},
              tenantPk: context.config?.key,
            }),
          onDone: [
            {
              target: States.onboarding,
              actions: [Actions.assignAuthToken, Actions.assignUserFound],
              cond: context => !!context.config,
            },
            {
              target: States.authenticationSuccess,
              actions: [Actions.assignAuthToken, Actions.assignUserFound],
            },
          ],
        },
      },
      [States.onboarding]: {
        invoke: {
          id: 'onboarding',
          src: context =>
            createOnboardingMachine({
              userFound: context.userFound!,
              device: context.device!,
              authToken: context.authToken!,
              config: context.config!,
            }),
          onDone: {
            target: States.complete,
            actions: [Actions.assignValidationToken, Actions.assignStatus],
          },
        },
      },
      [States.configInvalid]: {
        type: 'final',
      },
      [States.authenticationSuccess]: {
        type: 'final',
      },
      [States.complete]: {
        type: 'final',
      },
    },
  },
  {
    actions: {
      [Actions.assignInitContext]: assign((context, event) => {
        if (event.type !== Events.initContextUpdated) {
          return context;
        }
        const { device, config, bootstrapData } = event.payload;
        context.device = device !== undefined ? device : context.device;
        context.config = config !== undefined ? config : context.config;
        context.bootstrapData =
          bootstrapData !== undefined ? bootstrapData : context.bootstrapData;

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
      [Actions.assignValidationToken]: assign((context, event) => {
        if (event.type === Events.onboardingCompleted) {
          context.validationToken = event.data.validationToken;
        }
        return context;
      }),
      [Actions.assignStatus]: assign((context, event) => {
        if (event.type === Events.onboardingCompleted) {
          context.status = event.data.status;
        }
        return context;
      }),
      [Actions.resetContext]: assign(() => ({})),
    },
  },
);

export default bifrostMachine;
