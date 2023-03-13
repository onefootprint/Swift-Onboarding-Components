import { assign, createMachine } from 'xstate';

import {
  hasMissingAttributes,
  isMissingBasicDataAttribute,
  isMissingBeneficialOwnerAttribute,
  isMissingBusinessAddressAttribute,
} from '../missing-attributes';
import { MachineContext, MachineEvents } from './types';

/*
  TODO: 
  - Add doing-business-as
*/

const createCollectKybDataMachine = () =>
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
        missingKybAttributes: [],
        missingKycAttributes: [],
        data: {},
      },
      states: {
        init: {
          on: {
            receivedContext: [
              {
                target: 'introduction',
                actions: 'assignInitialContext',
                cond: (context, event) =>
                  hasMissingAttributes(event.payload.missingKybAttributes),
              },
              {
                target: 'completed',
                actions: 'assignInitialContext',
              },
            ],
          },
        },
        introduction: {
          on: {
            introductionCompleted: [
              {
                target: 'basicData',
                cond: context =>
                  isMissingBasicDataAttribute(context.missingKybAttributes),
              },
              {
                target: 'businessAddress',
                cond: context =>
                  isMissingBusinessAddressAttribute(
                    context.missingKybAttributes,
                  ),
              },
              {
                target: 'beneficialOwners',
                cond: context =>
                  isMissingBeneficialOwnerAttribute(
                    context.missingKybAttributes,
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
                    context.missingKybAttributes,
                  ),
              },
              {
                target: 'beneficialOwners',
                actions: 'assignBasicData',
                cond: context =>
                  isMissingBeneficialOwnerAttribute(
                    context.missingKybAttributes,
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
                    context.missingKybAttributes,
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
                  isMissingBasicDataAttribute(context.missingKybAttributes),
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
                    context.missingKybAttributes,
                  ),
              },
              {
                target: 'basicData',
                cond: context =>
                  isMissingBasicDataAttribute(context.missingKybAttributes),
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
                cond: context => context.missingKycAttributes.length > 0,
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
                    context.missingKybAttributes,
                  ),
              },
              {
                target: 'businessAddress',
                cond: context =>
                  isMissingBusinessAddressAttribute(
                    context.missingKybAttributes,
                  ),
              },
              {
                target: 'basicData',
                cond: context =>
                  isMissingBasicDataAttribute(context.missingKybAttributes),
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
        assignInitialContext: assign((context, event) => {
          const {
            authToken,
            device,
            config,
            userFound,
            email,
            missingKybAttributes,
            missingKycAttributes,
          } = event.payload;
          context.missingKybAttributes = [...missingKybAttributes];
          context.missingKycAttributes = [...missingKycAttributes];
          context.device = device;
          context.authToken = authToken;
          context.config = config;
          context.userFound = userFound;
          context.email = email;
          return context;
        }),
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
