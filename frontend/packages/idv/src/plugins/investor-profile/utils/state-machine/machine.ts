import cloneDeep from 'lodash/cloneDeep';
import { assign, createMachine } from 'xstate';

import type { CollectInvestorProfileRequirement } from '@onefootprint/types';
import type { DeviceInfo } from '../../../../hooks';
import {
  hasAnyDeclarationsData,
  isMissingDeclarationsData,
  isMissingEmploymentData,
  isMissingFundingSources,
  isMissingIncomeData,
  isMissingInvestmentGoalsData,
  isMissingNetWorthData,
  isMissingRiskToleranceData,
  omitNullAndUndefined,
} from '../utils';
import type { MachineContext, MachineEvents } from './types';

export type CreateInvestorProfileArgs = {
  device?: DeviceInfo;
  authToken?: string;
  showTransition?: boolean;
  investorRequirement?: CollectInvestorProfileRequirement;
};

const createCollectInvestorProfileDataMachine = ({
  device,
  authToken,
  showTransition,
  investorRequirement,
}: CreateInvestorProfileArgs) =>
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
        investorRequirement,
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
                vaultData: cloneDeep(omitNullAndUndefined({ ...context.vaultData, ...event.payload.data })),
              }
            : {
                ...context,
                data: { ...context.data, ...event.payload },
                vaultData: cloneDeep(omitNullAndUndefined({ ...context.vaultData, ...event.payload })),
              };
        }),
        setDeclarationStateVisited: assign(context => {
          return { ...context, isDeclarationStateVisited: true };
        }),
      },
    },
  );

export default createCollectInvestorProfileDataMachine;
