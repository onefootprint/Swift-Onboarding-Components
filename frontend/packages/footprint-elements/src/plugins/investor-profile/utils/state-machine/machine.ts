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
      context: {},
      states: {
        init: {},
        employment: {
          on: {
            employmentSubmitted: {
              target: 'brokerageEmployment',
              actions: 'assignEmployment',
            },
          },
        },
        brokerageEmployment: {
          on: {
            brokerageEmploymentSubmitted: {
              target: 'income',
              actions: 'assignBrokerageEmployment',
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
              actions: 'assignIncome',
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
              actions: 'assignNetWorth',
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
              actions: 'assignInvestmentGoals',
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
              actions: 'assignRiskTolerance',
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
              actions: 'assignConflictOfInterest',
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
        // TODO:
        assignEmployment: assign(context => context),
        // TODO:
        assignBrokerageEmployment: assign(context => context),
        // TODO:
        assignIncome: assign(context => context),
        // TODO:
        assignNetWorth: assign(context => context),
        // TODO:
        assignInvestmentGoals: assign(context => context),
        // TODO:
        assignRiskTolerance: assign(context => context),
        // TODO:
        assignConflictOfInterest: assign(context => context),
      },
    },
  );

export default createCollectInvestorProfileDataMachine;
