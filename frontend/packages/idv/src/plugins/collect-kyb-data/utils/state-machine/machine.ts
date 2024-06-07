import { assign, createMachine } from 'xstate';

import {
  hasMissingAttributes,
  isMissingBasicDataAttribute,
  isMissingBeneficialOwnerAttribute,
  isMissingBusinessAddressAttribute,
} from '../missing-attributes';
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
      context: { ...initialContext },
      states: {
        init: {
          always: [
            {
              target: 'introduction',
              cond: context => hasMissingAttributes(context.kybRequirement.missingAttributes),
            },
            {
              target: 'completed',
            },
          ],
        },
        introduction: {
          on: {
            introductionCompleted: [
              {
                target: 'basicData',
                cond: context => isMissingBasicDataAttribute(context.kybRequirement.missingAttributes),
              },
              {
                target: 'businessAddress',
                cond: context => isMissingBusinessAddressAttribute(context.kybRequirement.missingAttributes),
              },
              {
                target: 'beneficialOwners',
                cond: context => isMissingBeneficialOwnerAttribute(context.kybRequirement.missingAttributes),
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
              {
                target: 'businessAddress',
                actions: 'assignData',
                cond: context => isMissingBusinessAddressAttribute(context.kybRequirement.missingAttributes),
              },
              {
                target: 'beneficialOwners',
                actions: 'assignData',
                cond: context => isMissingBeneficialOwnerAttribute(context.kybRequirement.missingAttributes),
              },
              {
                target: 'confirm',
                actions: 'assignData',
              },
            ],
            navigatedToPrevPage: {
              target: 'introduction',
            },
          },
        },
        businessAddress: {
          on: {
            businessAddressSubmitted: [
              {
                target: 'beneficialOwners',
                actions: 'assignData',
                cond: context => isMissingBeneficialOwnerAttribute(context.kybRequirement.missingAttributes),
              },
              {
                target: 'confirm',
                actions: 'assignData',
              },
            ],
            navigatedToPrevPage: [
              {
                target: 'basicData',
                cond: context => isMissingBasicDataAttribute(context.kybRequirement.missingAttributes),
              },
              {
                target: 'introduction',
              },
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
                cond: context => isMissingBusinessAddressAttribute(context.kybRequirement.missingAttributes),
              },
              {
                target: 'basicData',
                cond: context => isMissingBasicDataAttribute(context.kybRequirement.missingAttributes),
              },
              {
                target: 'introduction',
              },
            ],
          },
        },
        confirm: {
          on: {
            confirmed: [
              {
                cond: context => !!context.kycRequirement,
                target: 'beneficialOwnerKyc',
              },
              {
                target: 'completed',
              },
            ],
            basicDataSubmitted: {
              actions: 'assignData',
            },
            businessAddressSubmitted: {
              actions: 'assignData',
            },
            beneficialOwnersSubmitted: {
              actions: 'assignData',
            },
            navigatedToPrevPage: [
              {
                target: 'beneficialOwners',
                cond: context => isMissingBeneficialOwnerAttribute(context.kybRequirement.missingAttributes),
              },
              {
                target: 'businessAddress',
                cond: context => isMissingBusinessAddressAttribute(context.kybRequirement.missingAttributes),
              },
              {
                target: 'basicData',
                cond: context => isMissingBasicDataAttribute(context.kybRequirement.missingAttributes),
              },
              {
                target: 'introduction',
              },
            ],
          },
        },
        beneficialOwnerKyc: {
          on: {
            beneficialOwnerKycSubmitted: {
              target: 'completed',
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
