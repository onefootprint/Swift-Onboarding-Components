import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import { getInitialValues, initialState, reducer } from './reducer';

describe('document flow reducer', () => {
  describe('when there is no playbook to overwrite', () => {
    it('should return the default values', () => {
      expect(getInitialValues()).toEqual(initialState);
    });
  });

  describe('when there is a playbook to overwrite', () => {
    it('should overwrite the name', () => {
      const playbook = getOnboardingConfiguration({ name: 'Document flow' });
      expect(getInitialValues(playbook)).toMatchObject({
        data: {
          nameForm: {
            name: 'Document flow',
          },
        },
      });
    });

    describe('document details', () => {
      it('should set government document details', () => {
        const playbook = getOnboardingConfiguration({
          documentTypesAndCountries: {
            global: ['passport'],
            countrySpecific: { US: ['drivers_license'] },
          },
        });
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            detailsForm: {
              gov: {
                global: ['passport'],
                country: { US: ['drivers_license'] },
              },
            },
          },
        });
      });

      it('should set additional document details', () => {
        const playbook = getOnboardingConfiguration({
          documentsToCollect: [
            { data: { requiresHumanReview: true }, kind: 'proof_of_address' },
            { data: { requiresHumanReview: true }, kind: 'proof_of_ssn' },
          ],
        });
        expect(getInitialValues(playbook)).toMatchObject({
          data: {
            detailsForm: {
              docs: {
                poa: true,
                possn: true,
                custom: [],
                requireManualReview: true,
              },
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

    it('should update document details data', () => {
      const state = reducer(initialState, {
        type: 'updateDetailsData',
        payload: {
          docs: {
            custom: [],
            poa: false,
            possn: false,
            requireManualReview: true,
          },
          gov: {
            country: { US: ['drivers_license'] },
            global: ['passport'],
            selfie: true,
            idDocFirst: true,
          },
        },
      });

      expect(state.data.detailsForm).toEqual({
        docs: {
          custom: [],
          poa: false,
          possn: false,
          requireManualReview: true,
        },
        gov: {
          country: { US: ['drivers_license'] },
          global: ['passport'],
          selfie: true,
          idDocFirst: true,
        },
      });
    });
  });
});
