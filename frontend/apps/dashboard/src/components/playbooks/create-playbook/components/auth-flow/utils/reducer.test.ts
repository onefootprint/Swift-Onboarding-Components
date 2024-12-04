import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import { getInitialValues, initialState, reducer } from './reducer';

describe('auth flow reducer', () => {
  describe('when there is no playbook to overwrite', () => {
    it('should return the default values', () => {
      expect(getInitialValues()).toEqual(initialState);
    });
  });

  describe('when there is a playbook to overwrite', () => {
    it('should overwrite the name', () => {
      const playbook = getOnboardingConfiguration({ name: 'Authentication flow' });
      expect(getInitialValues(playbook)).toMatchObject({
        data: {
          nameForm: {
            name: 'Authentication flow',
          },
        },
      });
    });

    describe('auth methods', () => {
      it('should set email auth when email is in requiredAuthMethods', () => {
        const playbook = getOnboardingConfiguration({ requiredAuthMethods: ['email'] });
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            requiredAuthMethodsForm: {
              email: true,
              phone: false,
            },
          },
        });
      });

      it('should set phone auth when phone is in requiredAuthMethods', () => {
        const playbook = getOnboardingConfiguration({ requiredAuthMethods: ['phone'] });
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            requiredAuthMethodsForm: {
              email: false,
              phone: true,
            },
          },
        });
      });
    });
  });

  describe('reducer', () => {
    it('should update step', () => {
      const state = reducer(initialState, { type: 'updateStep', payload: 'details' });
      expect(state.step).toBe('details');
    });

    it('should update name data', () => {
      const state = reducer(initialState, { type: 'updateNameData', payload: { name: 'New name' } });
      expect(state.data.nameForm.name).toBe('New name');
    });

    it('should update required auth methods data', () => {
      const state = reducer(initialState, {
        type: 'updateDetailsData',
        payload: { email: true, phone: false },
      });
      expect(state.data.requiredAuthMethodsForm).toEqual({ email: true, phone: false });
    });
  });
});
