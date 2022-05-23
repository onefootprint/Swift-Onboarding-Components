import { Events, States } from 'src/types/bifrost-machine';
import { assign, createMachine } from 'xstate';

type Identification = Partial<{
  email: string;
  phoneNumberLastTwo: string;
  challengeToken: string;
}>;

type Registration = Partial<{
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  ssn: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
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

const initialAuthTokenContext = undefined;

const bifrostMachine = createMachine<
  {
    identification: Identification;
    registration: Registration;
    authToken?: string;
  },
  | {
      type: Events.userFound;
      payload: Identification;
    }
  | { type: Events.userNotFound; payload: { email: string } }
  | { type: Events.changeEmail }
  | { type: Events.userCreated; payload: { authToken: string } }
  | { type: Events.userInherited; payload: { authToken: string } }
  | {
      type: Events.phoneSubmitted;
      payload: {
        phoneNumberLastTwo: string;
        challengeToken: string;
      };
    }
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
    authToken: initialAuthTokenContext,
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
          target: States.phoneVerification,
          actions: assign((context, { payload }) => ({
            ...context,
            identification: payload,
          })),
        },
      },
    },
    [States.phoneVerification]: {
      on: {
        [Events.userCreated]: {
          target: States.basicInformation,
          actions: assign((context, { payload }) => ({
            ...context,
            authToken: payload.authToken,
          })),
        },
        [Events.userInherited]: {
          target: States.verificationSuccess,
          actions: assign((context, { payload }) => ({
            ...context,
            authToken: payload.authToken,
          })),
        },
      },
    },
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
    [States.verificationSuccess]: {
      type: 'final',
    },
  },
});

export default bifrostMachine;
