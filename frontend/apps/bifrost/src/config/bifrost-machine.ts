import { Events, States } from 'src/types/bifrost-machine';
import { assign, createMachine } from 'xstate';

type Identification = Partial<{
  email: string;
  phoneLastTwoDigits: string;
  challengeToken: string;
}>;

type Registration = Partial<{
  city: string;
  country: string;
  dob: string;
  email: string;
  firstName: string;
  lastName: string;
  ssn: string;
  state: string;
  streetAddress: string;
  zipCode: string;
}>;

type BasicInformation = Required<
  Pick<Registration, 'firstName' | 'lastName' | 'dob'>
>;

type ResidentialAddress = Required<
  Pick<Registration, 'country' | 'streetAddress' | 'city' | 'zipCode' | 'state'>
>;

const initialIdentificationContext = {};

const initialRegistrationContext = {};

const bifrostMachine = createMachine<
  {
    identification: Identification;
    registration: Registration;
  },
  | {
      type: Events.userFound;
      payload: {
        phoneNumberLastTwo: string;
        challengeToken: string;
        email: string;
      };
    }
  | { type: Events.userNotFound; payload: { email: string } }
  | { type: Events.changeEmail }
  | { type: Events.userCreated }
  | { type: Events.userInherited }
  | { type: Events.phoneSubmitted }
  | {
      type: Events.basicInformationSubmitted;
      payload: {
        basicInformation: BasicInformation;
      };
    }
  | {
      type: Events.residentialAddressSubmitted;
      payload: {
        residentialAddress: ResidentialAddress;
      };
    }
  | { type: Events.ssnSubmitted; payload: { ssn: string } }
  | { type: Events.registrationCompleted }
>({
  id: 'bifrostMachine',
  initial: States.emailIdentification,
  context: {
    identification: initialIdentificationContext,
    registration: initialRegistrationContext,
  },
  states: {
    [States.emailIdentification]: {
      on: {
        [Events.userFound]: {
          target: States.phoneVerification,
          actions: assign((context, { payload }) => ({
            ...context,
            identification: payload,
          })),
        },
        [Events.userNotFound]: {
          target: States.phoneRegistration,
          actions: assign((context, { payload }) => {
            context.registration.email = payload.email;
            return context;
          }),
        },
      },
    },
    [States.phoneRegistration]: {
      on: {
        [Events.changeEmail]: {
          target: States.emailIdentification,
          actions: assign(context => {
            context.identification = initialIdentificationContext;
            context.registration = initialRegistrationContext;
            return context;
          }),
        },
        [Events.phoneSubmitted]: {
          target: States.emailIdentification,
        },
      },
    },
    [States.phoneVerification]: {
      on: {
        [Events.userCreated]: {
          target: 'registration',
        },
        [Events.userInherited]: {
          target: States.verificationSuccess,
        },
      },
    },
    registration: {
      type: 'compound',
      initial: States.basicInformation,
      states: {
        [States.basicInformation]: {
          on: {
            [Events.basicInformationSubmitted]: {
              target: States.residentialAddress,
              actions: assign((context, { payload }) => {
                context.registration = {
                  ...context.registration,
                  ...payload.basicInformation,
                };
                return context;
              }),
            },
          },
        },
        [States.residentialAddress]: {
          on: {
            [Events.residentialAddressSubmitted]: {
              target: States.ssn,
              actions: assign((context, { payload }) => {
                context.registration = {
                  ...context.registration,
                  ...payload.residentialAddress,
                };
                return context;
              }),
            },
          },
        },
        [States.ssn]: {
          on: {
            [Events.ssnSubmitted]: {
              target: States.registrationSuccess,
              actions: assign((context, { payload }) => {
                context.registration.ssn = payload.ssn;
                return context;
              }),
            },
          },
        },
        [States.registrationSuccess]: {
          type: 'final',
        },
      },
    },
    verificationSuccess: {
      type: 'final',
    },
  },
});

export default bifrostMachine;
