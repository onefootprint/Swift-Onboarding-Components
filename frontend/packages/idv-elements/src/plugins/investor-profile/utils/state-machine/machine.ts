import { InvestorProfileDI } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { Typegen0 } from './machine.typegen';
import type { MachineContext, MachineEvents } from './types';

const createCollectInvestorProfileDataMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'investor-profile',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as Typegen0,
      initial: 'init',
      context: {
        data: {},
      },
      states: {
        init: {
          on: {
            receivedContext: {
              target: 'employment',
              actions: 'assignInitialContext',
            },
          },
        },
        employment: {
          on: {
            employmentSubmitted: [
              {
                target: 'income',
                actions: 'assignData',
                cond: (context, event) =>
                  !!event.payload[InvestorProfileDI.occupation],
              },
              {
                target: 'income',
                actions: 'assignData',
              },
            ],
          },
        },
        income: {
          on: {
            incomeSubmitted: {
              target: 'netWorth',
              actions: 'assignData',
            },
            navigatedToPrevPage: {
              target: 'employment',
            },
          },
        },
        netWorth: {
          on: {
            netWorthSubmitted: {
              target: 'investmentGoals',
              actions: 'assignData',
            },
            navigatedToPrevPage: {
              target: 'income',
            },
          },
        },
        investmentGoals: {
          on: {
            investmentGoalsSubmitted: {
              target: 'riskTolerance',
              actions: 'assignData',
            },
            navigatedToPrevPage: {
              target: 'netWorth',
            },
          },
        },
        riskTolerance: {
          on: {
            riskToleranceSubmitted: {
              target: 'declarations',
              actions: 'assignData',
            },
            navigatedToPrevPage: {
              target: 'investmentGoals',
            },
          },
        },
        declarations: {
          on: {
            declarationsSubmitted: {
              target: 'completed',
              actions: 'assignData',
            },
            navigatedToPrevPage: {
              target: 'riskTolerance',
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
        assignInitialContext: assign((context, event) => ({
          ...context,
          ...event.payload,
        })),
        assignData: assign((context, event) => ({
          ...context,
          data: {
            ...context.data,
            ...event.payload,
          },
        })),
      },
    },
  );

export default createCollectInvestorProfileDataMachine;
