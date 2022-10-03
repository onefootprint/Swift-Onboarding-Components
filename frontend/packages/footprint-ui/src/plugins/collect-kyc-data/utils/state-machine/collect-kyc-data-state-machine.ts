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
                target: States.completed,
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
                target: States.completed,
                actions: [Actions.assignResidentialAddress],
              },
            ],
            [Events.navigatedToPrevPage]: [
              {
                target: States.basicInformation,
                cond: context =>
                  isMissingBasicAttribute(context.missingAttributes),
              },
            ],
          },
        },
        [States.ssn]: {
          on: {
            [Events.ssnSubmitted]: [
              {
                target: States.completed,
                actions: [Actions.assignSsn],
              },
            ],
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
        [States.completed]: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        [Actions.assignInitialContext]: assign((context, event) => {
          if (event.type === Events.receivedContext) {
            const { authToken, userFound, tenant, missingAttributes } =
              event.payload;
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
      },
    },
  );

export default createCollectKycDataMachine;
