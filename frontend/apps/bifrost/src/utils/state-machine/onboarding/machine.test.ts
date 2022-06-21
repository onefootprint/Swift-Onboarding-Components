import { interpret } from 'xstate';

import {
  BasicInformation,
  ResidentialAddress,
  UserData,
  UserDataAttribute,
} from '../types';
import createOnboardingMachine from './machine';
import { Events, States } from './types';

describe('Onboarding Machine Tests', () => {
  const createMachine = (
    missingAttributes: UserDataAttribute[],
    data?: UserData,
    missingWebauthnCredentials?: boolean,
  ) =>
    createOnboardingMachine({
      userFound: true,
      onboarding: {
        missingWebauthnCredentials: !!missingWebauthnCredentials,
        missingAttributes,
        data: data || {},
      },
      device: {
        hasSupportForWebAuthn: false,
        type: 'mobile',
      },
      authToken: 'authToken',
      tenant: {
        pk: 'pk',
        name: 'tenant',
        requiredUserData: [
          UserDataAttribute.firstName,
          UserDataAttribute.lastName,
          UserDataAttribute.email,
          UserDataAttribute.city,
          UserDataAttribute.ssn,
        ],
      },
    });

  describe('Correctly initializes and transitions out of init state', () => {
    it('User not found and missing attributes are set correctly in context', () => {
      const userFound = false;
      const data = {
        [UserDataAttribute.firstName]: 'FirstName',
      };
      const missingAttributes = [
        UserDataAttribute.firstName,
        UserDataAttribute.city,
      ];
      const missingWebauthnCredentials = false;
      const onboarding = {
        missingWebauthnCredentials,
        missingAttributes,
        data,
      };
      const device = {
        hasSupportForWebAuthn: false,
        type: 'mobile',
      };
      const authToken = 'authToken';
      const tenant = {
        pk: 'pk',
        name: 'tenant',
        requiredUserData: [
          UserDataAttribute.firstName,
          UserDataAttribute.lastName,
          UserDataAttribute.email,
          UserDataAttribute.city,
          UserDataAttribute.ssn,
        ],
      };
      const machine = interpret(
        createOnboardingMachine({
          userFound,
          onboarding,
          device,
          authToken,
          tenant,
        }),
      );
      machine.start();

      // Check that the initial context was set correctly from the args
      const { state } = machine;
      const { context } = state;
      expect(context.authToken).toEqual(authToken);
      expect(context.userFound).toEqual(userFound);
      expect(context.tenant).toEqual(tenant);
      expect(context.data).toEqual(data);
      expect(context.missingWebauthnCredentials).toEqual(
        missingWebauthnCredentials,
      );
      expect(context.missingAttributes).toEqual(missingAttributes);
      expect(context.device).toEqual(device);
      // Transitions to basic information since missing lastName
      expect(state.value).toEqual(States.basicInformation);
    });

    it('User not found, missing attributes and webauthn creds are set correctly in context', () => {
      const machine = interpret(
        createOnboardingMachine({
          userFound: false,
          onboarding: {
            missingWebauthnCredentials: true,
            missingAttributes: [
              UserDataAttribute.firstName,
              UserDataAttribute.city,
            ],
            data: {
              [UserDataAttribute.firstName]: 'FirstName',
            },
          },
          device: {
            hasSupportForWebAuthn: false,
            type: 'mobile',
          },
          authToken: 'authToken',
          tenant: {
            pk: 'pk',
            name: 'tenant',
            requiredUserData: [
              UserDataAttribute.firstName,
              UserDataAttribute.lastName,
              UserDataAttribute.email,
              UserDataAttribute.city,
              UserDataAttribute.ssn,
            ],
          },
        }),
      );
      machine.start();

      // Onboarding for a new user starts with liveness register
      const { state } = machine;
      const { context } = state;
      expect(context.userFound).toEqual(false);
      expect(context.missingWebauthnCredentials).toEqual(true);
      // When done liveness register machine transitions to residential address directly since basic info data is collected
      expect(machine.state.value).toEqual(States.residentialAddress);
    });

    it('User found and not missing any data are set correctly in context', () => {
      const machine = interpret(
        createOnboardingMachine({
          userFound: true,
          onboarding: {
            missingWebauthnCredentials: true,
            missingAttributes: [],
            data: {},
          },
          device: {
            hasSupportForWebAuthn: false,
            type: 'mobile',
          },
          authToken: 'authToken',
          tenant: {
            pk: 'pk',
            name: 'tenant',
            requiredUserData: [
              UserDataAttribute.firstName,
              UserDataAttribute.lastName,
              UserDataAttribute.email,
              UserDataAttribute.city,
              UserDataAttribute.ssn,
            ],
          },
        }),
      );
      machine.start();

      // Transitions to final state since no data needs to be collected in onboarding
      expect(machine.state.value).toEqual(States.onboardingSuccess);
    });

    it('User found and missing attributes are set correctly in context', () => {
      const machine = interpret(
        createOnboardingMachine({
          userFound: true,
          onboarding: {
            missingWebauthnCredentials: false,
            missingAttributes: [UserDataAttribute.city],
            data: {},
          },
          device: {
            hasSupportForWebAuthn: false,
            type: 'mobile',
          },
          authToken: 'authToken',
          tenant: {
            pk: 'pk',
            name: 'tenant',
            requiredUserData: [
              UserDataAttribute.firstName,
              UserDataAttribute.lastName,
              UserDataAttribute.email,
              UserDataAttribute.city,
              UserDataAttribute.ssn,
            ],
          },
        }),
      );
      machine.start();

      // Transitions to additional data required since user found
      expect(machine.state.value).toEqual(States.additionalDataRequired);
    });

    it('User found and missing attributes and webauthn creds are set correctly in context', () => {
      const machine = interpret(
        createOnboardingMachine({
          userFound: true,
          onboarding: {
            missingWebauthnCredentials: true,
            missingAttributes: [UserDataAttribute.ssn],
            data: {},
          },
          device: {
            hasSupportForWebAuthn: false,
            type: 'mobile',
          },
          authToken: 'authToken',
          tenant: {
            pk: 'pk',
            name: 'tenant',
            requiredUserData: [
              UserDataAttribute.firstName,
              UserDataAttribute.lastName,
              UserDataAttribute.email,
              UserDataAttribute.city,
              UserDataAttribute.ssn,
            ],
          },
        }),
      );
      machine.start();

      // Transitions to additional data required since user found
      expect(machine.state.value).toEqual(States.additionalDataRequired);
    });

    it('User found and missing webauthn creds are set correctly in context', () => {
      const machine = interpret(
        createOnboardingMachine({
          userFound: true,
          onboarding: {
            missingWebauthnCredentials: true,
            missingAttributes: [],
            data: {},
          },
          device: {
            hasSupportForWebAuthn: false,
            type: 'mobile',
          },
          authToken: 'authToken',
          tenant: {
            pk: 'pk',
            name: 'tenant',
            requiredUserData: [
              UserDataAttribute.firstName,
              UserDataAttribute.lastName,
              UserDataAttribute.email,
              UserDataAttribute.city,
              UserDataAttribute.ssn,
            ],
          },
        }),
      );
      machine.start();

      // In this case, we assume the user mobile device didn't support biometric checks
      // Since no other attributes are missing, don't show the liveness register again
      expect(machine.state.value).toEqual(States.onboardingSuccess);
    });
  });

  describe('Correctly transitions from States.additionalDataRequired', () => {
    it('States.livenessRegister should come first if missing webauthn creds', () => {
      const machine = createMachine(
        [UserDataAttribute.firstName, UserDataAttribute.lastName],
        {},
        true,
      );
      const state = machine.transition(States.additionalDataRequired, {
        type: Events.additionalInfoRequired,
      });
      expect(state.value).toBe(States.livenessRegister);
    });

    it('States.basicInformation should come first if not missing webauthn creds', () => {
      const machine = createMachine(
        [UserDataAttribute.firstName, UserDataAttribute.lastName],
        {},
      );
      const state = machine.transition(States.additionalDataRequired, {
        type: Events.additionalInfoRequired,
      });
      expect(state.value).toBe(States.basicInformation);
    });

    it('States.residentialAddress should come first if webauthn creds and basic information are complete', () => {
      const machine = createMachine([UserDataAttribute.city], {});
      const state = machine.transition(States.additionalDataRequired, {
        type: Events.additionalInfoRequired,
      });
      expect(state.value).toBe(States.residentialAddress);
    });

    it('States.ssn should come first if only ssn attribute is missing', () => {
      const machine = createMachine([UserDataAttribute.ssn], {});
      const state = machine.transition(States.additionalDataRequired, {
        type: Events.additionalInfoRequired,
      });
      expect(state.value).toBe(States.ssn);
    });

    it('States.onboardingSuccess if no attributes are missing', () => {
      const machine = createMachine([], {});
      const state = machine.transition(States.additionalDataRequired, {
        type: Events.additionalInfoRequired,
      });
      expect(state.value).toBe(States.onboardingSuccess);
    });
  });

  describe('Correctly transitions from States.basicInformation', () => {
    const basicInformation: BasicInformation = {
      [UserDataAttribute.firstName]: 'Belce',
      [UserDataAttribute.lastName]: 'Dogru',
      [UserDataAttribute.dob]: '05/24/1996',
    };

    it('Events.basicInformationSubmitted with no other missing attributes shows success', () => {
      const machine = createMachine(
        [UserDataAttribute.firstName, UserDataAttribute.lastName],
        {},
      );
      // If there are no residential attributes missing, directly go to success
      const state = machine.transition(States.basicInformation, {
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation,
        },
      });
      expect(state.context.data).toEqual(basicInformation);
      expect(state.value).toBe(States.onboardingSuccess);
    });

    it('Events.basicInformationSubmitted with missing residential shows residential', () => {
      const machine = createMachine(
        [
          UserDataAttribute.firstName,
          UserDataAttribute.city,
          UserDataAttribute.ssn,
        ],
        {},
      );
      // If there are residential attributes missing, go there
      const state = machine.transition(States.basicInformation, {
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation,
        },
      });
      expect(state.context.data).toEqual(basicInformation);
      expect(state.value).toBe(States.residentialAddress);
    });

    it('Events.basicInformationSubmitted with filled data for residential attributes directly skips to ssn', () => {
      const city = 'San Francisco';
      const machine = createMachine(
        [
          UserDataAttribute.firstName,
          UserDataAttribute.city,
          UserDataAttribute.ssn,
        ],
        { [UserDataAttribute.city]: city },
      );
      // Missing residential attributes already have data filled, so skip to ssn directly
      const state = machine.transition(States.basicInformation, {
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation,
        },
      });
      expect(state.context.data).toEqual({
        ...basicInformation,
        city,
      });
      // Since city is filled, skip directly to ssn
      expect(state.value).toBe(States.ssn);
    });
  });

  describe('Correctly transitions from States.residentialAddress', () => {
    const residentialAddress: ResidentialAddress = {
      [UserDataAttribute.streetAddress]: '413 Mississippi St',
      [UserDataAttribute.streetAddress2]: '',
      [UserDataAttribute.city]: 'San Francisco',
      [UserDataAttribute.country]: 'US',
      [UserDataAttribute.state]: 'CA',
      [UserDataAttribute.zip]: '94107',
    };

    it('Events.residentialAddressSubmitted with missing ssn shows ssn', () => {
      const machine = createMachine(
        [UserDataAttribute.city, UserDataAttribute.ssn],
        {},
      );

      // If ssn is missing, go to next step
      const state = machine.transition(States.residentialAddress, {
        type: Events.residentialAddressSubmitted,
        payload: {
          residentialAddress,
        },
      });
      expect(state.context.data).toEqual(residentialAddress);
      expect(state.value).toBe(States.ssn);
    });

    it('Events.residentialAddressSubmitted with no other missing attributes shows success', () => {
      const machine = createMachine([UserDataAttribute.city], {});
      // If no other attributes are missing, go to success directly
      const state = machine.transition(States.residentialAddress, {
        type: Events.residentialAddressSubmitted,
        payload: {
          residentialAddress,
        },
      });
      expect(state.context.data).toEqual(residentialAddress);
      expect(state.value).toBe(States.onboardingSuccess);
    });

    it('Events.residentialAddressSubmitted with ssn data already filled shows success', () => {
      const ssn = '00000';
      const machine = createMachine(
        [UserDataAttribute.city, UserDataAttribute.ssn],
        {
          [UserDataAttribute.ssn]: ssn,
        },
      );
      // If ssn attribute is missing but we already have data for it, skip to success directly
      const state = machine.transition(States.residentialAddress, {
        type: Events.residentialAddressSubmitted,
        payload: {
          residentialAddress,
        },
      });
      expect(state.context.data).toEqual({
        ...residentialAddress,
        ssn,
      });
      expect(state.value).toBe(States.onboardingSuccess);
    });

    it('Events.navigatedToPrevPage with missing basic information shows basic info', () => {
      const machine = createMachine(
        [UserDataAttribute.firstName, UserDataAttribute.city],
        { [UserDataAttribute.firstName]: 'Belce' },
      );
      // If basic information attributes were in missing attributes, go back to that
      const state = machine.transition(States.residentialAddress, {
        type: Events.navigatedToPrevPage,
      });
      // Only prev page is basic information
      expect(state.value).toBe(States.basicInformation);
    });

    it('Events.navigatedToPrevPage with missing residential attributes shows residential', () => {
      const machine = createMachine(
        [UserDataAttribute.city, UserDataAttribute.ssn],
        {},
      );
      // If no basic information attributes were in missing attributes, there is no prev page to go back to
      const state = machine.transition(States.residentialAddress, {
        type: Events.navigatedToPrevPage,
      });
      expect(state.value).toBe(States.residentialAddress);
    });
  });

  describe('Correctly transitions from States.ssn', () => {
    it('Events.ssnSubmitted always goes to success', () => {
      // SSN should be the last page in the flow, so go to success next
      const machine = createMachine([
        UserDataAttribute.firstName,
        UserDataAttribute.ssn,
      ]);
      const ssn = '00000';
      // SSN page always comes last, always go to success
      const state = machine.transition(States.ssn, {
        type: Events.ssnSubmitted,
        payload: {
          ssn,
        },
      });
      expect(state.context.data.ssn).toEqual(ssn);
      expect(state.value).toBe(States.onboardingSuccess);
    });

    it('Events.navigatedToPrevPage with missing residential info goes to residential', () => {
      const machine = createMachine([
        UserDataAttribute.firstName,
        UserDataAttribute.city,
        UserDataAttribute.ssn,
      ]);
      // Residential is in missing attributes so go back there
      expect(
        machine.transition(States.ssn, {
          type: Events.navigatedToPrevPage,
        }).value,
      ).toBe(States.residentialAddress);
    });

    it('Events.navigatedToPrevPage only with missing basic info goes to basic info', () => {
      const machine = createMachine([
        UserDataAttribute.firstName,
        UserDataAttribute.ssn,
      ]);
      // Since residential data was not missing, return to basic info
      expect(
        machine.transition(States.ssn, {
          type: Events.navigatedToPrevPage,
        }).value,
      ).toBe(States.basicInformation);
    });

    it('Events.navigatedToPrevPage with no other missing attributes cannot transition to prev page', () => {
      const machine = createMachine([UserDataAttribute.ssn]);
      // No other data was missing, this transition shouldn't have any effect
      expect(
        machine.transition(States.ssn, {
          type: Events.navigatedToPrevPage,
        }).value,
      ).toBe(States.ssn);
    });
  });
});
