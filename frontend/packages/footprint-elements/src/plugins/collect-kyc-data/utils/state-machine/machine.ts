import { UserDataAttribute } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import {
  isMissingBasicAttribute,
  isMissingEmailAttribute,
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
} from '../missing-attributes';
import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';

const createCollectKycDataMachine = () =>
  createMachine<MachineContext, MachineEvents>(
    {
      predictableActionArguments: true,
      id: 'kyc',
      initial: States.init,
      context: {
        missingAttributes: [],
        data: {},
      },
      states: {
        [States.init]: {
          on: {
            [Events.receivedContext]: [
              {
                target: States.email,
                actions: Actions.assignInitialContext,
                cond: (context, event) =>
                  // If email was passed into initial context, no need to collect again
                  isMissingEmailAttribute(event.payload.missingAttributes, {
                    ...context.data,
                    email: event.payload.email,
                  }),
              },
              {
                target: States.basicInformation,
                actions: Actions.assignInitialContext,
                cond: (context, event) =>
                  isMissingBasicAttribute(
                    event.payload.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.residentialAddress,
                actions: Actions.assignInitialContext,
                cond: (context, event) =>
                  isMissingResidentialAttribute(
                    event.payload.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.ssn,
                actions: Actions.assignInitialContext,
                cond: (context, event) =>
                  isMissingSsnAttribute(
                    event.payload.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.completed,
              },
            ],
          },
        },
        [States.email]: {
          on: {
            [Events.emailSubmitted]: [
              {
                target: States.basicInformation,
                actions: Actions.assignEmail,
                cond: context =>
                  isMissingBasicAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.residentialAddress,
                actions: [Actions.assignEmail],
                cond: context =>
                  isMissingResidentialAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.ssn,
                actions: [Actions.assignEmail],
                cond: context =>
                  isMissingSsnAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.confirm,
                actions: [Actions.assignEmail],
              },
            ],
          },
        },
        [States.basicInformation]: {
          on: {
            [Events.basicInformationSubmitted]: [
              {
                target: States.residentialAddress,
                actions: [Actions.assignBasicInformation],
                cond: context =>
                  isMissingResidentialAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.ssn,
                actions: [Actions.assignBasicInformation],
                cond: context =>
                  isMissingSsnAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.confirm,
                actions: [Actions.assignBasicInformation],
              },
            ],
            [Events.navigatedToPrevPage]: {
              target: States.email,
              cond: context =>
                isMissingEmailAttribute(context.missingAttributes),
            },
          },
        },
        [States.residentialAddress]: {
          on: {
            [Events.residentialAddressSubmitted]: [
              {
                target: States.ssn,
                actions: [Actions.assignResidentialAddress],
                cond: context =>
                  isMissingSsnAttribute(
                    context.missingAttributes,
                    context.data,
                  ),
              },
              {
                target: States.confirm,
                actions: [Actions.assignResidentialAddress],
              },
            ],
            [Events.navigatedToPrevPage]: [
              {
                target: States.basicInformation,
                cond: context =>
                  isMissingBasicAttribute(context.missingAttributes),
              },
              {
                target: States.email,
                cond: context =>
                  isMissingEmailAttribute(context.missingAttributes),
              },
            ],
          },
        },
        [States.ssn]: {
          on: {
            [Events.ssnSubmitted]: {
              target: States.confirm,
              actions: [Actions.assignSsn],
            },
            [Events.navigatedToPrevPage]: [
              {
                target: States.residentialAddress,
                cond: context =>
                  isMissingResidentialAttribute(context.missingAttributes),
              },
              {
                target: States.basicInformation,
                cond: context =>
                  isMissingBasicAttribute(context.missingAttributes),
              },
              {
                target: States.email,
                cond: context =>
                  isMissingEmailAttribute(context.missingAttributes),
              },
            ],
          },
        },
        [States.confirm]: {
          on: {
            [Events.confirmed]: [
              {
                target: States.completed,
              },
            ],
            [Events.navigatedToPrevPage]: [
              {
                target: States.ssn,
                cond: context =>
                  isMissingSsnAttribute(context.missingAttributes),
              },
              {
                target: States.residentialAddress,
                cond: context =>
                  isMissingResidentialAttribute(context.missingAttributes),
              },
              {
                target: States.basicInformation,
                cond: context =>
                  isMissingBasicAttribute(context.missingAttributes),
              },
              {
                target: States.email,
                cond: context =>
                  isMissingEmailAttribute(context.missingAttributes),
              },
            ],
            // Below are DESKTOP transitions
            [Events.editEmail]: {
              target: States.emailEditDesktop,
              cond: context => context.device?.type !== 'mobile',
            },
            [Events.editBasicInfo]: {
              target: States.basicInfoEditDesktop,
              cond: context => context.device?.type !== 'mobile',
            },
            [Events.editAddress]: {
              target: States.addressEditDesktop,
              cond: context => context.device?.type !== 'mobile',
            },
            [Events.editIdentity]: {
              target: States.identityEditDesktop,
              cond: context => context.device?.type !== 'mobile',
            },
            // Below are MOBILE transitions
            [Events.emailSubmitted]: {
              actions: [Actions.assignEmail],
              cond: context => context.device?.type === 'mobile',
            },
            [Events.basicInformationSubmitted]: {
              actions: [Actions.assignBasicInformation],
              cond: context => context.device?.type === 'mobile',
            },
            [Events.residentialAddressSubmitted]: {
              actions: [Actions.assignResidentialAddress],
              cond: context => context.device?.type === 'mobile',
            },
            [Events.ssnSubmitted]: {
              actions: [Actions.assignSsn],
              cond: context => context.device?.type === 'mobile',
            },
          },
        },
        [States.emailEditDesktop]: {
          on: {
            [Events.emailSubmitted]: [
              {
                target: States.confirm,
                cond: context => context.device?.type !== 'mobile',
                actions: [Actions.assignEmail],
              },
              {
                actions: [Actions.assignEmail],
              },
            ],
            [Events.returnToSummary]: {
              target: States.confirm,
              cond: context => context.device?.type !== 'mobile',
            },
          },
        },
        [States.basicInfoEditDesktop]: {
          on: {
            [Events.basicInformationSubmitted]: [
              {
                target: States.confirm,
                cond: context => context.device?.type !== 'mobile',
                actions: [Actions.assignBasicInformation],
              },
              {
                actions: [Actions.assignBasicInformation],
              },
            ],
            [Events.returnToSummary]: {
              target: States.confirm,
              cond: context => context.device?.type !== 'mobile',
            },
          },
        },
        [States.addressEditDesktop]: {
          on: {
            [Events.residentialAddressSubmitted]: [
              {
                target: States.confirm,
                cond: context => context.device?.type !== 'mobile',
                actions: [Actions.assignResidentialAddress],
              },
              {
                actions: [Actions.assignResidentialAddress],
              },
            ],
            [Events.returnToSummary]: {
              target: States.confirm,
              cond: context => context.device?.type !== 'mobile',
            },
          },
        },
        [States.identityEditDesktop]: {
          on: {
            [Events.ssnSubmitted]: [
              {
                target: States.confirm,
                cond: context => context.device?.type !== 'mobile',
                actions: [Actions.assignSsn],
              },
              {
                actions: [Actions.assignSsn],
              },
            ],
            [Events.returnToSummary]: {
              target: States.confirm,
              cond: context => context.device?.type !== 'mobile',
            },
          },
        },
        [States.completed]: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        [Actions.assignInitialContext]: assign((context, event) => {
          if (event.type === Events.receivedContext) {
            const {
              authToken,
              device,
              userFound,
              missingAttributes,
              email,
              config,
            } = event.payload;
            context.device = device;
            context.authToken = authToken;
            context.userFound = userFound;
            context.missingAttributes = [...missingAttributes];
            context.data[UserDataAttribute.email] = email;
            context.receivedEmail = !!email;
            context.config = config;
          }
          return context;
        }),
        [Actions.assignEmail]: assign((context, event) => {
          if (event.type === Events.emailSubmitted) {
            context.data.email = event.payload.email;
          }
          return context;
        }),
        [Actions.assignBasicInformation]: assign((context, event) => {
          if (event.type === Events.basicInformationSubmitted) {
            context.data = {
              ...context.data,
              ...event.payload.basicInformation,
            };
          }
          return context;
        }),
        [Actions.assignResidentialAddress]: assign((context, event) => {
          if (event.type === Events.residentialAddressSubmitted) {
            context.data = {
              ...context.data,
              ...event.payload.residentialAddress,
            };
          }
          return context;
        }),
        [Actions.assignSsn]: assign((context, event) => {
          if (event.type !== Events.ssnSubmitted) {
            return context;
          }
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
