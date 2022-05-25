import { assign, createMachine } from 'xstate';

import {
  Actions,
  BifrostContext,
  BifrostEvent,
  Events,
  States,
  UserDataAttribute,
} from './types';
import {
  hasMissingAttributes,
  isMissingBasicAttribute,
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
} from './utils/missing-attributes';

const initialIdentificationContext = {};
const initialRegistrationContext = {
  missingAttributes: new Set<UserDataAttribute>(),
  data: {},
};
const initialAuthTokenContext = undefined;
const initialContext = {
  identification: initialIdentificationContext,
  registration: initialRegistrationContext,
  authToken: initialAuthTokenContext,
};

const bifrostMachine = createMachine<BifrostContext, BifrostEvent>(
  {
    id: 'bifrostMachine',
    initial: States.emailIdentification,
    context: initialContext,
    states: {
      [States.emailIdentification]: {
        on: {
          [Events.userFound]: {
            target: States.phoneVerification,
            actions: [Actions.assignIdentification],
          },
          [Events.userNotFound]: {
            target: States.phoneRegistration,
            actions: [Actions.assignEmail],
          },
        },
      },
      [States.phoneRegistration]: {
        on: {
          [Events.changeEmail]: {
            target: States.emailIdentification,
            actions: [Actions.resetContext],
          },
          [Events.phoneSubmitted]: {
            target: States.phoneVerification,
            actions: [Actions.assignIdentification],
          },
        },
      },
      [States.phoneVerification]: {
        on: {
          [Events.userCreated]: [
            {
              target: States.basicInformation,
              actions: [Actions.assignAuthTokenWithMissingAttributes],
              cond: (context, event) =>
                isMissingBasicAttribute(event.payload.missingAttributes),
            },
            {
              target: States.residentialAddress,
              actions: [Actions.assignAuthTokenWithMissingAttributes],
              cond: (context, event) =>
                isMissingResidentialAttribute(event.payload.missingAttributes),
            },
            {
              target: States.ssn,
              actions: [Actions.assignAuthTokenWithMissingAttributes],
              cond: (context, event) =>
                isMissingSsnAttribute(event.payload.missingAttributes),
            },
            {
              target: States.registrationSuccess,
              actions: [Actions.assignAuthTokenWithMissingAttributes],
              cond: (context, event) =>
                !hasMissingAttributes(event.payload.missingAttributes),
            },
          ],
          [Events.userInherited]: [
            {
              target: States.basicInformation,
              actions: [Actions.assignAuthTokenWithMissingAttributes],
              cond: (context, event) =>
                isMissingBasicAttribute(event.payload.missingAttributes),
            },
            {
              target: States.residentialAddress,
              actions: [Actions.assignAuthTokenWithMissingAttributes],
              cond: (context, event) =>
                isMissingResidentialAttribute(event.payload.missingAttributes),
            },
            {
              target: States.ssn,
              actions: [Actions.assignAuthTokenWithMissingAttributes],
              cond: (context, event) =>
                isMissingSsnAttribute(event.payload.missingAttributes),
            },
            {
              target: States.verificationSuccess,
              actions: [Actions.assignAuthTokenWithMissingAttributes],
              cond: (context, event) =>
                !hasMissingAttributes(event.payload.missingAttributes),
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
                  context.registration.missingAttributes,
                ),
            },
            {
              target: States.ssn,
              actions: [Actions.assignBasicInformation],
              cond: context =>
                isMissingSsnAttribute(context.registration.missingAttributes),
            },
            {
              target: States.registrationSuccess,
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
                isMissingSsnAttribute(context.registration.missingAttributes),
            },
            {
              target: States.registrationSuccess,
              actions: [Actions.assignResidentialAddress],
            },
          ],
        },
      },
      [States.ssn]: {
        on: {
          [Events.ssnSubmitted]: [
            {
              target: States.registrationSuccess,
              actions: [Actions.assignSsn],
            },
          ],
        },
      },
      [States.registrationSuccess]: {
        type: 'final',
      },
      [States.verificationSuccess]: {
        type: 'final',
      },
    },
  },
  {
    actions: {
      [Actions.assignIdentification]: assign((context, event) => {
        if (
          event.type !== Events.userFound &&
          event.type !== Events.phoneSubmitted
        ) {
          return context;
        }
        return {
          ...context,
          identification: event.payload,
        };
      }),
      [Actions.assignEmail]: assign((context, event) => {
        if (event.type !== Events.userNotFound) {
          return context;
        }
        context.registration.data.email = event.payload.email;
        return context;
      }),
      [Actions.resetContext]: assign((context, event) => {
        if (event.type !== Events.changeEmail) {
          return context;
        }
        context.identification = initialIdentificationContext;
        context.registration = initialRegistrationContext;
        context.authToken = initialAuthTokenContext;
        return context;
      }),
      [Actions.assignAuthTokenWithMissingAttributes]: assign(
        (context, event) => {
          if (
            event.type !== Events.userCreated &&
            event.type !== Events.userInherited
          ) {
            return context;
          }
          return {
            ...context,
            authToken: event.payload.authToken,
            registration: {
              ...context.registration,
              missingAttributes: event.payload.missingAttributes,
            },
          };
        },
      ),
      [Actions.assignBasicInformation]: assign((context, event) => {
        if (event.type !== Events.basicInformationSubmitted) {
          return context;
        }
        context.registration = {
          ...context.registration,
          ...event.payload.basicInformation,
        };
        return context;
      }),
      [Actions.assignResidentialAddress]: assign((context, event) => {
        if (event.type !== Events.residentialAddressSubmitted) {
          return context;
        }
        context.registration = {
          ...context.registration,
          ...event.payload.residentialAddress,
        };
        return context;
      }),
      [Actions.assignSsn]: assign((context, event) => {
        if (event.type !== Events.ssnSubmitted) {
          return context;
        }
        context.registration.data.ssn = event.payload.ssn;
        return context;
      }),
    },
  },
);

export default bifrostMachine;
