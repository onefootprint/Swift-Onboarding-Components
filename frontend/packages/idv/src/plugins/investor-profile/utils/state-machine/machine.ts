import { InvestorProfileDI } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { DeviceInfo } from '../../../../hooks';
import type { MachineContext, MachineEvents } from './types';

export type CreateInvestorProfileArgs = {
  device?: DeviceInfo;
  authToken?: string;
  showTransition?: boolean;
};

export const isMissingEmploymentData = ({ data }: MachineContext): boolean => {
  const employmentStatus = data?.[InvestorProfileDI.employmentStatus];
  const occupation = data?.[InvestorProfileDI.occupation];
  const employer = data?.[InvestorProfileDI.employer];

  if (!employmentStatus) return true;
  return employmentStatus === 'employed' && (!occupation || !employer);
};

export const isMissingIncomeData = ({ data }: MachineContext): boolean => {
  return !data?.[InvestorProfileDI.annualIncome];
};

export const isMissingNetWorthData = ({ data }: MachineContext): boolean => {
  return !data?.[InvestorProfileDI.netWorth];
};

export const isMissingFundingSources = ({ data }: MachineContext): boolean => {
  return !data?.[InvestorProfileDI.fundingSources];
};

export const isMissingInvestmentGoalsData = ({ data }: MachineContext): boolean => {
  const goals = data?.[InvestorProfileDI.investmentGoals];
  if (!goals || !Array.isArray(goals)) return true;
  return goals.length === 0;
};

export const isMissingRiskToleranceData = ({ data }: MachineContext): boolean => {
  return !data?.[InvestorProfileDI.riskTolerance];
};

export const isMissingDeclarationsData = (_: MachineContext): boolean => {
  return false; /** Declarations are not mandatory step */
};

const createCollectInvestorProfileDataMachine = ({ device, authToken, showTransition }: CreateInvestorProfileArgs) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'investor-profile',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {
        device,
        authToken,
        showTransition,
        data: {},
      },
      states: {
        init: {
          on: {
            initDone: { target: 'redirectTo', actions: ['assignData'] },
            initFailed: { target: 'employment' },
          },
        },
        redirectTo: {
          always: [
            { target: 'employment', cond: isMissingEmploymentData },
            { target: 'income', cond: isMissingIncomeData },
            { target: 'netWorth', cond: isMissingNetWorthData },
            { target: 'fundingSources', cond: isMissingFundingSources },
            { target: 'investmentGoals', cond: isMissingInvestmentGoalsData },
            { target: 'riskTolerance', cond: isMissingRiskToleranceData },
            { target: 'declarations', cond: isMissingDeclarationsData },
            { target: 'confirm' },
          ],
        },
        employment: {
          on: {
            employmentSubmitted: [
              {
                target: 'income',
                actions: 'assignData',
                cond: (_, event) => !!event.payload[InvestorProfileDI.occupation],
              },
              { target: 'income', actions: 'assignData' },
            ],
          },
        },
        income: {
          on: {
            incomeSubmitted: { target: 'netWorth', actions: 'assignData' },
            navigatedToPrevPage: { target: 'employment' },
          },
        },
        netWorth: {
          on: {
            netWorthSubmitted: {
              target: 'fundingSources',
              actions: 'assignData',
            },
            navigatedToPrevPage: { target: 'income' },
          },
        },
        fundingSources: {
          on: {
            fundingSourcesSubmitted: {
              target: 'investmentGoals',
              actions: 'assignData',
            },
            navigatedToPrevPage: { target: 'netWorth' },
          },
        },
        investmentGoals: {
          on: {
            investmentGoalsSubmitted: {
              target: 'riskTolerance',
              actions: 'assignData',
            },
            navigatedToPrevPage: { target: 'fundingSources' },
          },
        },
        riskTolerance: {
          on: {
            riskToleranceSubmitted: {
              target: 'declarations',
              actions: 'assignData',
            },
            navigatedToPrevPage: { target: 'investmentGoals' },
          },
        },
        declarations: {
          on: {
            declarationsSubmitted: { target: 'confirm', actions: 'assignData' },
            navigatedToPrevPage: { target: 'riskTolerance' },
          },
        },
        confirm: {
          on: {
            navigatedToPrevPage: { target: 'declarations' },
            incomeSubmitted: { actions: 'assignData' },
            netWorthSubmitted: { actions: 'assignData' },
            fundingSourcesSubmitted: { actions: 'assignData' },
            investmentGoalsSubmitted: { actions: 'assignData' },
            riskToleranceSubmitted: { actions: 'assignData' },
            declarationsSubmitted: { actions: 'assignData' },
            confirmed: { target: 'completed' },
          },
        },
        completed: { type: 'final' },
      },
    },
    {
      actions: {
        assignData: assign((context, event) => {
          return event.type === 'declarationsSubmitted'
            ? {
                ...context,
                declarationFiles: event.payload.files,
                data: { ...context.data, ...event.payload.data },
              }
            : {
                ...context,
                data: { ...context.data, ...event.payload },
              };
        }),
      },
    },
  );

export default createCollectInvestorProfileDataMachine;
