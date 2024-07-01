import { InvestorProfileDI } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { DeviceInfo } from '../../../../hooks';
import type { MachineContext, MachineEvents } from './types';

export type CreateInvestorProfileArgs = {
  device?: DeviceInfo;
  authToken?: string;
  showTransition?: boolean;
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
      initial: 'employment',
      context: {
        device,
        authToken,
        showTransition,
        data: {},
      },
      states: {
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
            netWorthSubmitted: { target: 'investmentGoals', actions: 'assignData' },
            navigatedToPrevPage: { target: 'income' },
          },
        },
        investmentGoals: {
          on: {
            investmentGoalsSubmitted: { target: 'riskTolerance', actions: 'assignData' },
            navigatedToPrevPage: { target: 'netWorth' },
          },
        },
        riskTolerance: {
          on: {
            riskToleranceSubmitted: { target: 'declarations', actions: 'assignData' },
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
