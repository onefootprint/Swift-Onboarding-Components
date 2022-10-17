import { assign, createMachine } from 'xstate';

import {
  isMissingBasicAttribute,
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
                target: States.basicInformation,
                actions: Actions.assignInitialContext,
                cond: (context, event) =>
                  !event.payload.userFound ||
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
            [Events.navigatedToPrevPage]: {
              target: States.basicInformation,
              cond: context =>
                isMissingBasicAttribute(context.missingAttributes),
            },
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
            ],
          },
        },
        [States.confirm]: {
          on: {
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
            [Events.confirmed]: [
              {
                target: States.completed,
                actions: [Actions.assignKycPending],
                cond: (context, event) => !event.payload?.kycPending,
              },
              {
                actions: [Actions.assignKycPending],
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
            ],
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
            [Events.basicInformationSubmitted]: [
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
            const { authToken, device, userFound, tenant, missingAttributes } =
              event.payload;
            context.device = device;
            context.authToken = authToken;
            context.userFound = userFound;
            context.tenant = { ...tenant };
            context.missingAttributes = [...missingAttributes];
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
        [Actions.assignKycPending]: assign((context, event) => {
          if (event.type === Events.confirmed) {
            context.kycPending = event.payload?.kycPending;
          }
          return context;
        }),
      },
    },
  );

export default createCollectKycDataMachine;
