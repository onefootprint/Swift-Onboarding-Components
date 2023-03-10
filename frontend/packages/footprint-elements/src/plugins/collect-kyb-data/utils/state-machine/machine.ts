import { assign, createMachine } from 'xstate';

import {
  hasMissingAttributes,
  isMissingBasicDataAttribute,
  isMissingBeneficialOwnerAttribute,
  isMissingBusinessAddressAttribute,
} from '../missing-attributes';
import { MachineContext, MachineEvents } from './types';

/*
  TODO: 
  - Add navigated to prev page transitions
  - Add pages for optional fields like doing-business-as, website, phone number
*/

const createCollectKybDataMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'collect-kyb-data',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {
        missingAttributes: [],
        data: {},
      },
      states: {
        init: {
          on: {
            receivedContext: [
              {
                target: 'introduction',
                actions: 'assignInitialContext',
                cond: (context, event) =>
                  hasMissingAttributes(event.payload.missingAttributes),
              },
              {
                target: 'completed',
                actions: 'assignInitialContext',
              },
            ],
          },
        },
        introduction: {
          on: {
            introductionCompleted: [
              {
                target: 'basicData',
                cond: context =>
                  isMissingBasicDataAttribute(context.missingAttributes),
              },
              {
                target: 'businessAddress',
                cond: context =>
                  isMissingBusinessAddressAttribute(context.missingAttributes),
              },
              {
                target: 'beneficialOwners',
                cond: context =>
                  isMissingBeneficialOwnerAttribute(context.missingAttributes),
              },
              {
                target: 'confirm',
              },
            ],
          },
        },
        basicData: {
          on: {
            basicDataSubmitted: [
              {
                target: 'businessAddress',
                actions: 'assignBasicData',
                cond: context =>
                  isMissingBusinessAddressAttribute(context.missingAttributes),
              },
              {
                target: 'beneficialOwners',
                actions: 'assignBasicData',
                cond: context =>
                  isMissingBeneficialOwnerAttribute(context.missingAttributes),
              },
              {
                target: 'confirm',
                actions: 'assignBasicData',
              },
            ],
          },
        },
        businessAddress: {
          on: {
            businessAddressSubmitted: [
              {
                target: 'beneficialOwners',
                actions: 'assignBusinessAddress',
                cond: context =>
                  isMissingBeneficialOwnerAttribute(context.missingAttributes),
              },
              {
                target: 'confirm',
                actions: 'assignBusinessAddress',
              },
            ],
          },
        },
        beneficialOwners: {
          on: {
            beneficialOwnersSubmitted: [
              {
                target: 'confirm',
                actions: 'assignBeneficialOwners',
              },
            ],
          },
        },
        confirm: {
          on: {
            confirmed: {
              target: 'completed',
            },
            // Desktop transitions
            editBasicData: {
              target: 'basicDataEditDesktop',
              cond: context => context.device?.type !== 'mobile',
            },
            editBusinessAddress: {
              target: 'businessAddressEditDesktop',
              cond: context => context.device?.type !== 'mobile',
            },
            editBeneficialOwners: {
              target: 'beneficialOwnersEditDesktop',
              cond: context => context.device?.type !== 'mobile',
            },
            // Mobile transitions
            basicDataSubmitted: {
              actions: 'assignBasicData',
              cond: context => context.device?.type === 'mobile',
            },
            businessAddressSubmitted: {
              actions: 'assignBusinessAddress',
              cond: context => context.device?.type === 'mobile',
            },
            beneficialOwnersSubmitted: {
              actions: 'assignBeneficialOwners',
              cond: context => context.device?.type === 'mobile',
            },
          },
        },
        basicDataEditDesktop: {
          on: {
            basicDataSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device?.type !== 'mobile',
                actions: 'assignBasicData',
              },
              {
                actions: 'assignBasicData',
              },
            ],
            returnToSummary: {
              target: 'confirm',
              cond: context => context.device?.type !== 'mobile',
            },
          },
        },
        businessAddressEditDesktop: {
          on: {
            businessAddressSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device?.type !== 'mobile',
                actions: 'assignBusinessAddress',
              },
              {
                actions: 'assignBusinessAddress',
              },
            ],
            returnToSummary: {
              target: 'confirm',
              cond: context => context.device?.type !== 'mobile',
            },
          },
        },
        beneficialOwnersEditDesktop: {
          on: {
            beneficialOwnersSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device?.type !== 'mobile',
                actions: 'assignBeneficialOwners',
              },
              {
                actions: 'assignBeneficialOwners',
              },
            ],
            returnToSummary: {
              target: 'confirm',
              cond: context => context.device?.type !== 'mobile',
            },
          },
        },
        completed: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignInitialContext: assign((context, event) => {
          const { authToken, device, config, missingAttributes } =
            event.payload;
          context.device = device;
          context.authToken = authToken;
          context.config = config;
          context.missingAttributes = [...missingAttributes];
          return context;
        }),
        assignBasicData: assign((context, event) => {
          context.data = {
            ...context.data,
            ...event.payload,
          };
          return context;
        }),
        assignBusinessAddress: assign((context, event) => {
          context.data = {
            ...context.data,
            ...event.payload,
          };
          return context;
        }),
        assignBeneficialOwners: assign((context, event) => {
          context.data = {
            ...context.data,
            ...event.payload,
          };
          return context;
        }),
      },
    },
  );

export default createCollectKybDataMachine;
