import { assign, createMachine } from 'xstate';

import {
  getBusinessDataFromContext,
  isMissingAddressData,
  isMissingBasicData,
  isMissingBeneficialOwnersData,
  isMissingRequiredData,
} from '../attributes';
import type { LoadSuccessEvent, MachineContext, MachineEvents } from './types';

type PredicateFn = (ctx: MachineContext) => boolean;

const fromLoad = (predicate: PredicateFn) => (context: MachineContext, event: LoadSuccessEvent) =>
  predicate({ ...context, data: { ...context.data, ...event.payload.data } });

const createCollectKybDataMachine = (initialContext: MachineContext) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'collect-kyb-data',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'loadFromVault',
      context: {
        ...initialContext,
        data: getBusinessDataFromContext(initialContext),
        vaultBusinessData: {},
      },
      states: {
        loadFromVault: {
          on: {
            businessDataLoadSuccess: [
              { target: 'introduction', cond: fromLoad(isMissingRequiredData), actions: 'assignVaultData' },
              { target: 'basicData', cond: fromLoad(isMissingBasicData), actions: 'assignVaultData' },
              { target: 'businessAddress', cond: fromLoad(isMissingAddressData), actions: 'assignVaultData' },
              { target: 'beneficialOwners', cond: fromLoad(isMissingBeneficialOwnersData), actions: 'assignVaultData' },
              { target: 'confirm', actions: 'assignVaultData' },
            ],
            businessDataLoadError: [
              { target: 'introduction', cond: isMissingRequiredData },
              { target: 'basicData', cond: isMissingBasicData },
              { target: 'businessAddress', cond: isMissingAddressData },
              { target: 'beneficialOwners', cond: isMissingBeneficialOwnersData },
              { target: 'confirm' },
            ],
          },
        },
        introduction: {
          on: {
            introductionCompleted: [
              { target: 'basicData', cond: isMissingBasicData },
              { target: 'businessAddress', cond: isMissingAddressData },
              { target: 'beneficialOwners', cond: isMissingBeneficialOwnersData },
              { target: 'confirm' },
            ],
          },
        },
        basicData: {
          on: {
            basicDataSubmitted: [
              { target: 'businessAddress', actions: 'assignData', cond: isMissingAddressData },
              { target: 'beneficialOwners', actions: 'assignData', cond: isMissingBeneficialOwnersData },
              { target: 'confirm', actions: 'assignData' },
            ],
            navigatedToPrevPage: {
              target: 'introduction',
            },
          },
        },
        businessAddress: {
          on: {
            businessAddressSubmitted: [
              { target: 'beneficialOwners', actions: 'assignData', cond: isMissingBeneficialOwnersData },
              { target: 'confirm', actions: 'assignData' },
            ],
            navigatedToPrevPage: [
              {
                target: 'basicData',
                cond: isMissingBasicData,
              },
              { target: 'introduction' },
            ],
          },
        },
        beneficialOwners: {
          on: {
            beneficialOwnersSubmitted: [
              {
                target: 'confirm',
                actions: 'assignData',
              },
            ],
            navigatedToPrevPage: [
              { target: 'businessAddress', cond: isMissingAddressData },
              { target: 'basicData', cond: isMissingBasicData },
              { target: 'introduction' },
            ],
          },
        },
        confirm: {
          on: {
            confirmed: [
              { target: 'beneficialOwnerKyc', cond: context => !!context.kycRequirement },
              { target: 'completed' },
            ],
            basicDataSubmitted: { actions: 'assignData' },
            businessAddressSubmitted: { actions: 'assignData' },
            beneficialOwnersSubmitted: { actions: 'assignData' },
            navigatedToPrevPage: [
              { target: 'beneficialOwners', cond: isMissingBeneficialOwnersData },
              { target: 'businessAddress', cond: isMissingAddressData },
              { target: 'basicData', cond: isMissingBasicData },
              { target: 'introduction' },
            ],
            stepUpAuthTokenCompleted: { actions: ['assignAuthToken'] },
            stepUpDecryptionCompleted: { actions: ['assignData'] },
          },
        },
        beneficialOwnerKyc: {
          on: {
            beneficialOwnerKycSubmitted: { target: 'completed' },
          },
        },
        completed: { type: 'final' },
      },
    },
    {
      actions: {
        assignData: assign((ctx, event) => {
          ctx.data = {
            ...ctx.data,
            ...event.payload,
          };
          return ctx;
        }),
        assignVaultData: assign((ctx, { payload }) => {
          ctx.vaultBusinessData = {
            ...ctx.vaultBusinessData,
            ...payload.vaultBusinessData,
          };
          ctx.data = {
            ...ctx.data,
            ...payload.data,
          };
          return ctx;
        }),
        assignAuthToken: assign((ctx, { payload }) => ({
          ...ctx,
          authToken: payload,
        })),
      },
    },
  );

export default createCollectKybDataMachine;
