import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';

const createCollectInvestorProfileDataMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'investor-profile',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {
        data: {},
      },
      states: {
        init: {},
        employment: {
          on: {
            employmentSubmitted: {
              target: 'brokerageEmployment',
              actions: 'assignData',
            },
          },
        },
        brokerageEmployment: {
          on: {
            brokerageEmploymentSubmitted: {
              target: 'income',
              actions: 'assignData',
            },
            navigatedToPrevPage: {
              target: 'employment',
            },
          },
        },
        income: {
          on: {
            incomeSubmitted: {
              target: 'netWorth',
              actions: 'assignData',
            },
            navigatedToPrevPage: {
              target: 'brokerageEmployment',
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
              target: 'conflictOfInterest',
              actions: 'assignData',
            },
            navigatedToPrevPage: {
              target: 'riskTolerance',
            },
          },
        },
        conflictOfInterest: {
          on: {
            conflictOfInterestSubmitted: {
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
