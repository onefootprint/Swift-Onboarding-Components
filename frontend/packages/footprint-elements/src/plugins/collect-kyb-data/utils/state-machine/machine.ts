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
  - Add confirm page transitions
  - Add edit flows for both desktop and mobile
  - Add unit tests for state machine
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
        businessAddress: {
          on: {
            businessAddressSubmitted: [
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
        beneficialOwners: {
          on: {
            beneficialOwnersSubmitted: [
              {
                target: 'confirm',
              },
            ],
          },
        },
        confirm: {
          on: {
            confirmed: {
              target: 'completed',
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
          const { authToken, device, config } = event.payload;
          context.device = device;
          context.authToken = authToken;
          context.config = config;
          return context;
        }),
      },
    },
  );

export default createCollectKybDataMachine;
