import { assign, createMachine } from 'xstate';

import mergeData from '../merge-data/merge-data';
import mergeInitialData from '../merge-initial-data/merge-initial-data';
import {
  isMissingBasicAttribute,
  isMissingEmailAttribute,
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
  shouldConfirm,
} from '../missing-attributes';
import { MachineContext, MachineEvents } from './types';

const createCollectKycDataMachine = (initialContext: MachineContext) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'collect-kyc-data',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: { ...initialContext },
      states: {
        init: {
          on: {
            initialized: {
              actions: ['assignInitialData'],
              target: 'router',
            },
          },
        },
        router: {
          always: [
            {
              target: 'email',
              cond: context =>
                // If email was passed into initial context, no need to collect again
                isMissingEmailAttribute(
                  context.requirement.missingAttributes,
                  context.data,
                ),
            },
            {
              target: 'basicInformation',
              cond: context =>
                isMissingBasicAttribute(
                  context.requirement.missingAttributes,
                  context.data,
                ),
            },
            {
              target: 'residentialAddress',
              cond: context =>
                isMissingResidentialAttribute(
                  context.requirement.missingAttributes,
                  context.data,
                ),
            },
            {
              target: 'ssn',
              cond: context =>
                isMissingSsnAttribute(
                  context.requirement.missingAttributes,
                  context.data,
                ),
            },
            {
              target: 'confirm',
              cond: context => shouldConfirm(context.data),
            },
            {
              target: 'completed',
            },
          ],
        },
        email: {
          on: {
            dataSubmitted: [
              {
                target: 'basicInformation',
                actions: 'assignData',
                cond: context =>
                  isMissingBasicAttribute(
                    context.requirement.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: 'residentialAddress',
                actions: ['assignData'],
                cond: context =>
                  isMissingResidentialAttribute(
                    context.requirement.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: 'ssn',
                actions: ['assignData'],
                cond: context =>
                  isMissingSsnAttribute(
                    context.requirement.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: 'confirm',
                actions: ['assignData'],
              },
            ],
          },
        },
        basicInformation: {
          on: {
            dataSubmitted: [
              {
                target: 'residentialAddress',
                actions: ['assignData'],
                cond: context =>
                  isMissingResidentialAttribute(
                    context.requirement.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: 'ssn',
                actions: ['assignData'],
                cond: context =>
                  isMissingSsnAttribute(
                    context.requirement.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: 'confirm',
                actions: ['assignData'],
              },
            ],
            navigatedToPrevPage: {
              target: 'email',
              cond: context =>
                isMissingEmailAttribute(
                  context.requirement.missingAttributes,
                  context.initialData,
                ),
            },
          },
        },
        residentialAddress: {
          on: {
            dataSubmitted: [
              {
                target: 'ssn',
                actions: ['assignData'],
                cond: context =>
                  isMissingSsnAttribute(
                    context.requirement.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: 'confirm',
                actions: ['assignData'],
              },
            ],
            navigatedToPrevPage: [
              {
                target: 'basicInformation',
                cond: context =>
                  isMissingBasicAttribute(
                    context.requirement.missingAttributes,
                    context.initialData,
                  ),
              },
              {
                target: 'email',
                cond: context =>
                  isMissingEmailAttribute(
                    context.requirement.missingAttributes,
                    context.initialData,
                  ),
              },
            ],
          },
        },
        ssn: {
          on: {
            dataSubmitted: {
              target: 'confirm',
              actions: ['assignData'],
            },
            navigatedToPrevPage: [
              {
                target: 'residentialAddress',
                cond: context =>
                  isMissingResidentialAttribute(
                    context.requirement.missingAttributes,
                    context.initialData,
                  ),
              },
              {
                target: 'basicInformation',
                cond: context =>
                  isMissingBasicAttribute(
                    context.requirement.missingAttributes,
                    context.initialData,
                  ),
              },
              {
                target: 'email',
                cond: context =>
                  isMissingEmailAttribute(
                    context.requirement.missingAttributes,
                    context.initialData,
                  ),
              },
            ],
          },
        },
        confirm: {
          on: {
            confirmed: [
              {
                target: 'completed',
              },
            ],
            navigatedToPrevPage: [
              {
                target: 'ssn',
                cond: context =>
                  isMissingSsnAttribute(
                    context.requirement.missingAttributes,
                    context.initialData,
                  ),
              },
              {
                target: 'residentialAddress',
                cond: context =>
                  isMissingResidentialAttribute(
                    context.requirement.missingAttributes,
                    context.initialData,
                  ),
              },
              {
                target: 'basicInformation',
                cond: context =>
                  isMissingBasicAttribute(
                    context.requirement.missingAttributes,
                    context.initialData,
                  ),
              },
              {
                target: 'email',
                cond: context =>
                  isMissingEmailAttribute(
                    context.requirement.missingAttributes,
                    context.initialData,
                  ),
              },
            ],
            // Below are DESKTOP transitions
            editEmail: {
              target: 'emailEditDesktop',
              cond: context => context.device.type !== 'mobile',
            },
            editBasicInfo: {
              target: 'basicInfoEditDesktop',
              cond: context => context.device.type !== 'mobile',
            },
            editAddress: {
              target: 'addressEditDesktop',
              cond: context => context.device.type !== 'mobile',
            },
            editIdentity: {
              target: 'identityEditDesktop',
              cond: context => context.device.type !== 'mobile',
            },
            // Below are MOBILE transitions
            dataSubmitted: {
              actions: ['assignData'],
              cond: context => context.device.type === 'mobile',
            },
          },
        },
        emailEditDesktop: {
          on: {
            dataSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device.type !== 'mobile',
                actions: ['assignData'],
              },
              {
                actions: ['assignData'],
              },
            ],
            returnToSummary: {
              target: 'confirm',
              cond: context => context.device.type !== 'mobile',
            },
          },
        },
        basicInfoEditDesktop: {
          on: {
            dataSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device.type !== 'mobile',
                actions: ['assignData'],
              },
              {
                actions: ['assignData'],
              },
            ],
            returnToSummary: {
              target: 'confirm',
              cond: context => context.device.type !== 'mobile',
            },
          },
        },
        addressEditDesktop: {
          on: {
            dataSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device.type !== 'mobile',
                actions: ['assignData'],
              },
              {
                actions: ['assignData'],
              },
            ],
            returnToSummary: {
              target: 'confirm',
              cond: context => context.device.type !== 'mobile',
            },
          },
        },
        identityEditDesktop: {
          on: {
            dataSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device.type !== 'mobile',
                actions: ['assignData'],
              },
              {
                actions: ['assignData'],
              },
            ],
            returnToSummary: {
              target: 'confirm',
              cond: context => context.device.type !== 'mobile',
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
          context.data = mergeData(context.data, event.payload);
          return context;
        }),
        assignInitialData: assign((context, event) => {
          context.data = mergeInitialData(context.data, event.payload);
          // Snapshot the set of data we have before starting to collect from users. This helps
          // us decide the page to visit when hitting the back button
          return {
            ...context,
            initialData: context.data,
          };
        }),
      },
    },
  );

export default createCollectKycDataMachine;
