import { IdDI, OnboardingRequirementKind } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import {
  isMissingBasicAttribute,
  isMissingEmailAttribute,
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
} from '../missing-attributes';
import { MachineContext, MachineEvents } from './types';

const createCollectKycDataMachine = () =>
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
      context: {
        requirement: {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: [],
        },
        data: {},
      },
      states: {
        init: {
          on: {
            receivedContext: [
              {
                target: 'email',
                actions: 'assignInitialContext',
                cond: (context, event) =>
                  // If email was passed into initial context, no need to collect again
                  isMissingEmailAttribute(
                    event.payload.requirement.missingAttributes,
                    // TODO: fix this ugliness in the next PR
                    {
                      ...context.data,
                      [IdDI.email]: event.payload.bootstrapData?.[IdDI.email]
                        ? {
                            value: event.payload.bootstrapData?.[IdDI.email],
                          }
                        : undefined,
                    },
                  ),
              },
              {
                target: 'basicInformation',
                actions: 'assignInitialContext',
                cond: (context, event) =>
                  isMissingBasicAttribute(
                    event.payload.requirement.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: 'residentialAddress',
                actions: 'assignInitialContext',
                cond: (context, event) =>
                  isMissingResidentialAttribute(
                    event.payload.requirement.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: 'ssn',
                actions: 'assignInitialContext',
                cond: (context, event) =>
                  isMissingSsnAttribute(
                    event.payload.requirement.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: 'completed',
              },
            ],
          },
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
                isMissingEmailAttribute(context.requirement.missingAttributes),
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
                  ),
              },
              {
                target: 'email',
                cond: context =>
                  isMissingEmailAttribute(
                    context.requirement.missingAttributes,
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
                  ),
              },
              {
                target: 'basicInformation',
                cond: context =>
                  isMissingBasicAttribute(
                    context.requirement.missingAttributes,
                  ),
              },
              {
                target: 'email',
                cond: context =>
                  isMissingEmailAttribute(
                    context.requirement.missingAttributes,
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
                  isMissingSsnAttribute(context.requirement.missingAttributes),
              },
              {
                target: 'residentialAddress',
                cond: context =>
                  isMissingResidentialAttribute(
                    context.requirement.missingAttributes,
                  ),
              },
              {
                target: 'basicInformation',
                cond: context =>
                  isMissingBasicAttribute(
                    context.requirement.missingAttributes,
                  ),
              },
              {
                target: 'email',
                cond: context =>
                  isMissingEmailAttribute(
                    context.requirement.missingAttributes,
                  ),
              },
            ],
            // Below are DESKTOP transitions
            editEmail: {
              target: 'emailEditDesktop',
              cond: context => context.device?.type !== 'mobile',
            },
            editBasicInfo: {
              target: 'basicInfoEditDesktop',
              cond: context => context.device?.type !== 'mobile',
            },
            editAddress: {
              target: 'addressEditDesktop',
              cond: context => context.device?.type !== 'mobile',
            },
            editIdentity: {
              target: 'identityEditDesktop',
              cond: context => context.device?.type !== 'mobile',
            },
            // Below are MOBILE transitions
            dataSubmitted: {
              actions: ['assignData'],
              cond: context => context.device?.type === 'mobile',
            },
          },
        },
        emailEditDesktop: {
          on: {
            dataSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device?.type !== 'mobile',
                actions: ['assignData'],
              },
              {
                actions: ['assignData'],
              },
            ],
            returnToSummary: {
              target: 'confirm',
              cond: context => context.device?.type !== 'mobile',
            },
          },
        },
        basicInfoEditDesktop: {
          on: {
            dataSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device?.type !== 'mobile',
                actions: ['assignData'],
              },
              {
                actions: ['assignData'],
              },
            ],
            returnToSummary: {
              target: 'confirm',
              cond: context => context.device?.type !== 'mobile',
            },
          },
        },
        addressEditDesktop: {
          on: {
            dataSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device?.type !== 'mobile',
                actions: ['assignData'],
              },
              {
                actions: ['assignData'],
              },
            ],
            returnToSummary: {
              target: 'confirm',
              cond: context => context.device?.type !== 'mobile',
            },
          },
        },
        identityEditDesktop: {
          on: {
            dataSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device?.type !== 'mobile',
                actions: ['assignData'],
              },
              {
                actions: ['assignData'],
              },
            ],
            returnToSummary: {
              target: 'confirm',
              cond: context => context.device?.type !== 'mobile',
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
            userFound,
            requirement,
            sandboxSuffix,
            config,
            bootstrapData,
            fixedFields,
          } = event.payload;
          context.device = device;
          context.authToken = authToken;
          context.userFound = userFound;
          context.sandboxSuffix = sandboxSuffix;
          context.config = config;
          context.requirement = requirement;

          if (bootstrapData) {
            Object.entries(bootstrapData).forEach(([key, value]) => {
              context.data[key as IdDI] = {
                value,
                bootstrap: true,
              };
            });
          }
          if (fixedFields) {
            fixedFields.forEach(field => {
              const entry = context.data[field];
              if (entry) {
                entry.fixed = true;
              }
            });
          }

          return context;
        }),
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

export default createCollectKycDataMachine;
