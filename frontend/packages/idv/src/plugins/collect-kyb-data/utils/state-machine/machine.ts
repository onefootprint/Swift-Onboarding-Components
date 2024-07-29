import { assign, createMachine } from 'xstate';

import {
  getBusinessDataFromContext,
  isMissingAddressData,
  isMissingBasicData,
  isMissingBeneficialOwnersData,
  isMissingRequiredData,
} from '../attributes';
import type { MachineContext, MachineEvents } from './types';

type PredicateFn = (ctx: MachineContext) => boolean;
type LoadSuccessEvent = { type: 'businessDataLoadSuccess'; payload: MachineContext['data'] };

const fromLoad = (predicate: PredicateFn) => (context: MachineContext, event: LoadSuccessEvent) =>
  predicate({ ...context, data: { ...context.data, ...event.payload } });

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
      initial: 'init',
      context: {
        ...initialContext,
        data: getBusinessDataFromContext(initialContext),
      },
      states: {
        init: {
          always: [
            { target: 'loadFromVault', cond: ctx => !!ctx.kybRequirement.isMet && isMissingBasicData(ctx) },
            { target: 'introduction', cond: isMissingRequiredData },
            { target: 'introduction', cond: isMissingBeneficialOwnersData },
            { target: 'confirm' },
          ],
        },
        loadFromVault: {
          on: {
            businessDataLoadSuccess: [
              { target: 'basicData', cond: fromLoad(isMissingBasicData), actions: 'assignData' },
              { target: 'businessAddress', cond: fromLoad(isMissingAddressData), actions: 'assignData' },
              { target: 'beneficialOwners', cond: fromLoad(isMissingBeneficialOwnersData), actions: 'assignData' },
              { target: 'confirm', actions: 'assignData' },
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
        assignAuthToken: assign((ctx, { payload }) => ({
          ...ctx,
          authToken: payload,
        })),
      },
    },
  );

export default createCollectKybDataMachine;
