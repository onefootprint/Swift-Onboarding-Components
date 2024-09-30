import { InvestorProfileDI } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { DeviceInfo } from '../../../../hooks';
import { isStringValid } from '../../../../utils/type-guards';
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
  const sources = data?.[InvestorProfileDI.fundingSources];
  if (!sources || !Array.isArray(sources)) return true;
  return sources.length === 0;
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

/** Triggers track actions for initial missing data in the investor profile. */
export const trackInitializedSteps = (tracker: (action: string) => void, data: MachineContext['data'] = {}): void => {
  const flowOrder = [
    { isMissing: isMissingEmploymentData, action: 'investor-profile:employment-submit' },
    { isMissing: isMissingIncomeData, action: 'investor-profile:income-submit' },
    { isMissing: isMissingNetWorthData, action: 'investor-profile:net-worth-submit' },
    { isMissing: isMissingFundingSources, action: 'investor-profile:funding-sources-submit' },
    { isMissing: isMissingInvestmentGoalsData, action: 'investor-profile:investment-goals-submit' },
    { isMissing: isMissingRiskToleranceData, action: 'investor-profile:risk-tolerance-submit' },
  ];

  for (const { isMissing, action } of flowOrder) {
    if (!isMissing({ data })) {
      tracker(action);
    } else {
      break;
    }
  }
};

export const hasAnyDeclarationsData = ({ data }: MachineContext): boolean => {
  if (isStringValid(data?.[InvestorProfileDI.brokerageFirmEmployer])) {
    return true;
  }
  if (isStringValid(data?.[InvestorProfileDI.politicalOrganization])) {
    return true;
  }

  const familyMemberNamesValue = data?.[InvestorProfileDI.familyMemberNames];
  if (
    Array.isArray(familyMemberNamesValue) &&
    familyMemberNamesValue.length > 0 &&
    familyMemberNamesValue.every(isStringValid)
  ) {
    return true;
  }

  const seniorExecutiveSymbolsValue = data?.[InvestorProfileDI.seniorExecutiveSymbols];
  if (
    Array.isArray(seniorExecutiveSymbolsValue) &&
    seniorExecutiveSymbolsValue.length > 0 &&
    seniorExecutiveSymbolsValue.every(isStringValid)
  ) {
    return true;
  }

  return false;
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
            initFailed: { target: 'redirectTo' },
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
            {
              /** Once "declarations" becomes not optional, we can remove the isDeclarationStateVisited context.prop */
              target: 'declarations',
              cond: ctx => {
                if (isMissingDeclarationsData(ctx)) {
                  return true;
                }
                if (hasAnyDeclarationsData(ctx)) {
                  return false;
                }
                return !ctx.isDeclarationStateVisited;
              },
            },
            { target: 'confirm' },
          ],
        },
        employment: {
          on: {
            employmentSubmitted: { target: 'redirectTo', actions: 'assignData' },
          },
        },
        income: {
          on: {
            incomeSubmitted: { target: 'redirectTo', actions: 'assignData' },
            navigatedToPrevPage: { target: 'employment' },
          },
        },
        netWorth: {
          on: {
            netWorthSubmitted: { target: 'redirectTo', actions: 'assignData' },
            navigatedToPrevPage: { target: 'income' },
          },
        },
        fundingSources: {
          on: {
            fundingSourcesSubmitted: { target: 'redirectTo', actions: 'assignData' },
            navigatedToPrevPage: { target: 'netWorth' },
          },
        },
        investmentGoals: {
          on: {
            investmentGoalsSubmitted: { target: 'redirectTo', actions: 'assignData' },
            navigatedToPrevPage: { target: 'fundingSources' },
          },
        },
        riskTolerance: {
          on: {
            riskToleranceSubmitted: { target: 'redirectTo', actions: 'assignData' },
            navigatedToPrevPage: { target: 'investmentGoals' },
          },
        },
        declarations: {
          on: {
            declarationsSubmitted: { target: 'redirectTo', actions: 'assignData' },
            navigatedToPrevPage: { target: 'riskTolerance' },
          },
          exit: 'setDeclarationStateVisited',
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
        setDeclarationStateVisited: assign(context => {
          return { ...context, isDeclarationStateVisited: true };
        }),
      },
    },
  );

export default createCollectInvestorProfileDataMachine;
