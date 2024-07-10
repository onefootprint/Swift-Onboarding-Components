import { assign, createMachine } from 'xstate';

import {
  getBusinessDataFromContext,
  hasAnyMissingRequiredAttribute,
  hasMissingAddressData,
  hasMissingBasicData,
  hasMissingBeneficialOwners,
} from '../attributes';
import type { Typegen0 } from './machine.typegen';
import type { MachineContext, MachineEvents } from './types';

const createCollectKybDataMachine = (initialContext: MachineContext) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'collect-kyb-data',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as Typegen0,
      initial: 'init',
      context: {
        ...initialContext,
        data: getBusinessDataFromContext(initialContext),
      },
      states: {
        init: {
          always: [
            {
              target: 'introduction',
              cond: hasAnyMissingRequiredAttribute,
            },
            { target: 'confirm' },
          ],
        },
        introduction: {
          on: {
            introductionCompleted: [
              {
                target: 'basicData',
                cond: hasMissingBasicData,
              },
              {
                target: 'businessAddress',
                cond: hasMissingAddressData,
              },
              {
                target: 'beneficialOwners',
                cond: hasMissingBeneficialOwners,
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
              { target: 'businessAddress', actions: 'assignData', cond: hasMissingAddressData },
              { target: 'beneficialOwners', actions: 'assignData', cond: hasMissingBeneficialOwners },
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
              { target: 'beneficialOwners', actions: 'assignData', cond: hasMissingBeneficialOwners },
              { target: 'confirm', actions: 'assignData' },
            ],
            navigatedToPrevPage: [
              {
                target: 'basicData',
                cond: hasMissingBasicData,
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
              {
                target: 'businessAddress',
                cond: hasMissingAddressData,
              },
              {
                target: 'basicData',
                cond: hasMissingBasicData,
              },
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
              { target: 'beneficialOwners', cond: hasMissingBeneficialOwners },
              { target: 'businessAddress', cond: hasMissingAddressData },
              { target: 'basicData', cond: hasMissingBasicData },
              { target: 'introduction' },
            ],
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
        assignData: assign((context, event) => {
          context.data = {
            ...context.data,
            ...event.payload,
          };
          return context;
        }),
      },
    },
  );

export default createCollectKybDataMachine;
