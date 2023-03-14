import { UserDataAttribute } from '@onefootprint/types';
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
        missingAttributes: [],
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
                  isMissingEmailAttribute(event.payload.missingAttributes, {
                    ...context.data,
                    email: event.payload.email,
                  }),
              },
              {
                target: 'basicInformation',
                actions: 'assignInitialContext',
                cond: (context, event) =>
                  isMissingBasicAttribute(
                    event.payload.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: 'residentialAddress',
                actions: 'assignInitialContext',
                cond: (context, event) =>
                  isMissingResidentialAttribute(
                    event.payload.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: 'ssn',
                actions: 'assignInitialContext',
                cond: (context, event) =>
                  isMissingSsnAttribute(
                    event.payload.missingAttributes,
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
            emailSubmitted: [
              {
                target: 'basicInformation',
                actions: 'assignEmail',
                cond: context =>
                  isMissingBasicAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: 'residentialAddress',
                actions: ['assignEmail'],
                cond: context =>
                  isMissingResidentialAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: 'ssn',
                actions: ['assignEmail'],
                cond: context =>
                  isMissingSsnAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: 'confirm',
                actions: ['assignEmail'],
              },
            ],
          },
        },
        basicInformation: {
          on: {
            basicInformationSubmitted: [
              {
                target: 'residentialAddress',
                actions: ['assignBasicInformation'],
                cond: context =>
                  isMissingResidentialAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: 'ssn',
                actions: ['assignBasicInformation'],
                cond: context =>
                  isMissingSsnAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: 'confirm',
                actions: ['assignBasicInformation'],
              },
            ],
            navigatedToPrevPage: {
              target: 'email',
              cond: context =>
                isMissingEmailAttribute(context.missingAttributes),
            },
          },
        },
        residentialAddress: {
          on: {
            residentialAddressSubmitted: [
              {
                target: 'ssn',
                actions: ['assignResidentialAddress'],
                cond: context =>
                  isMissingSsnAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: 'confirm',
                actions: ['assignResidentialAddress'],
              },
            ],
            navigatedToPrevPage: [
              {
                target: 'basicInformation',
                cond: context =>
                  isMissingBasicAttribute(context.missingAttributes),
              },
              {
                target: 'email',
                cond: context =>
                  isMissingEmailAttribute(context.missingAttributes),
              },
            ],
          },
        },
        ssn: {
          on: {
            ssnSubmitted: {
              target: 'confirm',
              actions: ['assignSsn'],
            },
            navigatedToPrevPage: [
              {
                target: 'residentialAddress',
                cond: context =>
                  isMissingResidentialAttribute(context.missingAttributes),
              },
              {
                target: 'basicInformation',
                cond: context =>
                  isMissingBasicAttribute(context.missingAttributes),
              },
              {
                target: 'email',
                cond: context =>
                  isMissingEmailAttribute(context.missingAttributes),
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
                  isMissingSsnAttribute(context.missingAttributes),
              },
              {
                target: 'residentialAddress',
                cond: context =>
                  isMissingResidentialAttribute(context.missingAttributes),
              },
              {
                target: 'basicInformation',
                cond: context =>
                  isMissingBasicAttribute(context.missingAttributes),
              },
              {
                target: 'email',
                cond: context =>
                  isMissingEmailAttribute(context.missingAttributes),
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
            emailSubmitted: {
              actions: ['assignEmail'],
              cond: context => context.device?.type === 'mobile',
            },
            basicInformationSubmitted: {
              actions: ['assignBasicInformation'],
              cond: context => context.device?.type === 'mobile',
            },
            residentialAddressSubmitted: {
              actions: ['assignResidentialAddress'],
              cond: context => context.device?.type === 'mobile',
            },
            ssnSubmitted: {
              actions: ['assignSsn'],
              cond: context => context.device?.type === 'mobile',
            },
          },
        },
        emailEditDesktop: {
          on: {
            emailSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device?.type !== 'mobile',
                actions: ['assignEmail'],
              },
              {
                actions: ['assignEmail'],
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
            basicInformationSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device?.type !== 'mobile',
                actions: ['assignBasicInformation'],
              },
              {
                actions: ['assignBasicInformation'],
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
            residentialAddressSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device?.type !== 'mobile',
                actions: ['assignResidentialAddress'],
              },
              {
                actions: ['assignResidentialAddress'],
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
            ssnSubmitted: [
              {
                target: 'confirm',
                cond: context => context.device?.type !== 'mobile',
                actions: ['assignSsn'],
              },
              {
                actions: ['assignSsn'],
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
            missingAttributes,
            email,
            sandboxSuffix,
            config,
            fixedData,
          } = event.payload;
          context.device = device;
          context.authToken = authToken;
          context.userFound = userFound;
          context.missingAttributes = [...missingAttributes];
          context.data[UserDataAttribute.email] = email;
          context.receivedEmail = !!email;
          context.sandboxSuffix = sandboxSuffix;
          context.config = config;
          context.fixedData = fixedData;
          return context;
        }),
        assignEmail: assign((context, event) => {
          context.data.email = event.payload.email;
          return context;
        }),
        assignBasicInformation: assign((context, event) => {
          context.data = {
            ...context.data,
            ...event.payload.basicInformation,
          };
          return context;
        }),
        assignResidentialAddress: assign((context, event) => {
          context.data = {
            ...context.data,
            ...event.payload.residentialAddress,
          };
          return context;
        }),
        assignSsn: assign((context, event) => {
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
