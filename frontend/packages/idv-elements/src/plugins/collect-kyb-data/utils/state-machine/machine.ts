import { assign, createMachine } from 'xstate';

import {
  hasMissingAttributes,
  isMissingBasicDataAttribute,
  isMissingBeneficialOwnerAttribute,
  isMissingBusinessAddressAttribute,
} from '../missing-attributes';
import { MachineContext, MachineEvents } from './types';

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
      context: { ...initialContext },
      states: {
        init: {
          always: [
            {
              target: 'introduction',
              cond: context =>
                hasMissingAttributes(context.kybRequirement.missingAttributes),
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
                cond: context =>
                  isMissingBasicDataAttribute(
                    context.kybRequirement.missingAttributes,
                  ),
              },
              {
                target: 'businessAddress',
                cond: context =>
                  isMissingBusinessAddressAttribute(
                    context.kybRequirement.missingAttributes,
                  ),
              },
              {
                target: 'beneficialOwners',
                cond: context =>
                  isMissingBeneficialOwnerAttribute(
                    context.kybRequirement.missingAttributes,
                  ),
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
                actions: 'assignBasicData',
                cond: context =>
                  isMissingBusinessAddressAttribute(
                    context.kybRequirement.missingAttributes,
                  ),
              },
              {
                target: 'beneficialOwners',
                actions: 'assignBasicData',
                cond: context =>
                  isMissingBeneficialOwnerAttribute(
                    context.kybRequirement.missingAttributes,
                  ),
              },
              {
                target: 'confirm',
                actions: 'assignBasicData',
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
                actions: 'assignBusinessAddress',
                cond: context =>
                  isMissingBeneficialOwnerAttribute(
                    context.kybRequirement.missingAttributes,
                  ),
              },
              {
                target: 'confirm',
                actions: 'assignBusinessAddress',
              },
            ],
            navigatedToPrevPage: [
              {
                target: 'basicData',
                cond: context =>
                  isMissingBasicDataAttribute(
                    context.kybRequirement.missingAttributes,
                  ),
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
                actions: 'assignBeneficialOwners',
              },
            ],
            navigatedToPrevPage: [
              {
                target: 'businessAddress',
                cond: context =>
                  isMissingBusinessAddressAttribute(
                    context.kybRequirement.missingAttributes,
                  ),
              },
              {
                target: 'basicData',
                cond: context =>
                  isMissingBasicDataAttribute(
                    context.kybRequirement.missingAttributes,
                  ),
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
            // Desktop transitions
            editBasicData: {
              target: 'basicDataEditDesktop',
              cond: context => context.device?.type !== 'mobile',
            },
            editBusinessAddress: {
              target: 'businessAddressEditDesktop',
              cond: context => context.device?.type !== 'mobile',
            },
            editBeneficialOwners: {
              target: 'beneficialOwnersEditDesktop',
              cond: context => context.device?.type !== 'mobile',
            },
            // Mobile transitions
            basicDataSubmitted: {
              actions: 'assignBasicData',
              cond: context => context.device?.type === 'mobile',
            },
            businessAddressSubmitted: {
              actions: 'assignBusinessAddress',
              cond: context => context.device?.type === 'mobile',
            },
            beneficialOwnersSubmitted: {
              actions: 'assignBeneficialOwners',
              cond: context => context.device?.type === 'mobile',
            },
            navigatedToPrevPage: [
              {
                target: 'beneficialOwners',
                cond: context =>
                  isMissingBeneficialOwnerAttribute(
                    context.kybRequirement.missingAttributes,
                  ),
              },
              {
                target: 'businessAddress',
                cond: context =>
                  isMissingBusinessAddressAttribute(
                    context.kybRequirement.missingAttributes,
                  ),
              },
              {
                target: 'basicData',
                cond: context =>
                  isMissingBasicDataAttribute(
                    context.kybRequirement.missingAttributes,
                  ),
              },
              {
                target: 'introduction',
              },
            ],
          },
        },
        basicDataEditDesktop: {
          on: {
            basicDataSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device?.type !== 'mobile',
                actions: 'assignBasicData',
              },
              {
                actions: 'assignBasicData',
              },
            ],
            returnToSummary: {
              target: 'confirm',
              cond: context => context.device?.type !== 'mobile',
            },
          },
        },
        businessAddressEditDesktop: {
          on: {
            businessAddressSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device?.type !== 'mobile',
                actions: 'assignBusinessAddress',
              },
              {
                actions: 'assignBusinessAddress',
              },
            ],
            returnToSummary: {
              target: 'confirm',
              cond: context => context.device?.type !== 'mobile',
            },
          },
        },
        beneficialOwnersEditDesktop: {
          on: {
            beneficialOwnersSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device?.type !== 'mobile',
                actions: 'assignBeneficialOwners',
              },
              {
                actions: 'assignBeneficialOwners',
              },
            ],
            returnToSummary: {
              target: 'confirm',
              cond: context => context.device?.type !== 'mobile',
            },
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
        assignBasicData: assign((context, event) => {
          context.data = {
            ...context.data,
            ...event.payload,
          };
          return context;
        }),
        assignBusinessAddress: assign((context, event) => {
          context.data = {
            ...context.data,
            ...event.payload,
          };
          return context;
        }),
        assignBeneficialOwners: assign((context, event) => {
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
