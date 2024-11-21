import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import createDiff from './create-playbook-diff';

describe('createDiff', () => {
  describe('Name', () => {
    it('should return diff with updated name', () => {
      const oldPlaybook = getOnboardingConfiguration({
        name: 'Old name',
      });
      const updatedPlaybook = getOnboardingConfiguration({
        name: 'New name',
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Name',
            changes: [
              {
                alias: 'playbook-name-updated',
                old: 'Old name',
                updated: 'New name',
              },
            ],
          },
        ]),
      );
    });
  });

  describe('Residency', () => {
    it('should show when residency changes from US to international (all countries)', () => {
      const oldPlaybook = getOnboardingConfiguration({
        allowUsResidents: true,
        allowInternationalResidents: false,
        allowUsTerritoryResidents: false,
        internationalCountryRestrictions: undefined,
      });
      const updatedPlaybook = getOnboardingConfiguration({
        allowUsResidents: false,
        allowInternationalResidents: true,
        allowUsTerritoryResidents: false,
        internationalCountryRestrictions: [],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Residency',
            changes: [
              {
                alias: 'residency-us-to-international',
                old: 'US residents',
                updated: 'International residents (all countries)',
              },
            ],
          },
        ]),
      );
    });

    it('should show when residency changes from US to international with country restrictions', () => {
      const oldPlaybook = getOnboardingConfiguration({
        allowUsResidents: true,
        allowInternationalResidents: false,
        allowUsTerritoryResidents: true,
        internationalCountryRestrictions: undefined,
      });
      const updatedPlaybook = getOnboardingConfiguration({
        allowUsResidents: false,
        allowInternationalResidents: true,
        allowUsTerritoryResidents: false,
        internationalCountryRestrictions: ['GB', 'FR'],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Residency',
            changes: [
              {
                alias: 'residency-us-to-international',
                old: 'US and US territory residents',
                updated: 'International residents (GB, FR)',
              },
            ],
          },
        ]),
      );
    });

    it('should show when residency changes from international to US', () => {
      const oldPlaybook = getOnboardingConfiguration({
        allowUsResidents: false,
        allowInternationalResidents: true,
        allowUsTerritoryResidents: false,
        internationalCountryRestrictions: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        allowUsResidents: true,
        allowInternationalResidents: false,
        allowUsTerritoryResidents: false,
        internationalCountryRestrictions: undefined,
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Residency',
            changes: [
              {
                alias: 'residency-international-to-us',
                old: 'International residents (all countries)',
                updated: 'US residents',
              },
            ],
          },
        ]),
      );
    });

    it('should show when US territory is added', () => {
      const oldPlaybook = getOnboardingConfiguration({
        allowUsResidents: true,
        allowUsTerritoryResidents: false,
        internationalCountryRestrictions: undefined,
        allowInternationalResidents: false,
      });
      const updatedPlaybook = getOnboardingConfiguration({
        allowUsResidents: true,
        allowUsTerritoryResidents: true,
        internationalCountryRestrictions: undefined,
        allowInternationalResidents: false,
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Residency',
            changes: [
              {
                alias: 'residency-add-us-territory',
                old: 'US residents',
                updated: 'US and US territory residents',
              },
            ],
          },
        ]),
      );
    });

    it('should show when US territory is removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        allowUsResidents: true,
        allowUsTerritoryResidents: true,
        internationalCountryRestrictions: undefined,
        allowInternationalResidents: false,
      });
      const updatedPlaybook = getOnboardingConfiguration({
        allowUsResidents: true,
        allowUsTerritoryResidents: false,
        internationalCountryRestrictions: undefined,
        allowInternationalResidents: false,
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Residency',
            changes: [
              {
                alias: 'residency-remove-us-territory',
                old: 'US and US territory residents',
                updated: 'US residents',
              },
            ],
          },
        ]),
      );
    });

    it('should show when country restrictions are added', () => {
      const oldPlaybook = getOnboardingConfiguration({
        allowUsResidents: false,
        allowUsTerritoryResidents: false,
        allowInternationalResidents: true,
        internationalCountryRestrictions: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        allowUsResidents: false,
        allowUsTerritoryResidents: false,
        allowInternationalResidents: true,
        internationalCountryRestrictions: ['GB', 'FR'],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Residency',
            changes: [
              {
                alias: 'residency-add-country-restrictions',
                old: 'International residents (all countries)',
                updated: 'International residents (GB, FR)',
              },
            ],
          },
        ]),
      );
    });

    it('should show when country restrictions are removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        allowUsResidents: false,
        allowUsTerritoryResidents: false,
        allowInternationalResidents: true,
        internationalCountryRestrictions: ['GB', 'FR'],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        allowUsResidents: false,
        allowUsTerritoryResidents: false,
        allowInternationalResidents: true,
        internationalCountryRestrictions: [],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Residency',
            changes: [
              {
                alias: 'residency-remove-country-restrictions',
                old: 'International residents (GB, FR)',
                updated: 'International residents (all countries)',
              },
            ],
          },
        ]),
      );
    });

    it('should show when country restrictions are updated', () => {
      const oldPlaybook = getOnboardingConfiguration({
        allowUsResidents: false,
        allowUsTerritoryResidents: false,
        allowInternationalResidents: true,
        internationalCountryRestrictions: ['GB', 'FR'],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        allowUsResidents: false,
        allowUsTerritoryResidents: false,
        allowInternationalResidents: true,
        internationalCountryRestrictions: ['GB', 'DE'],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Residency',
            changes: [
              {
                alias: 'residency-update-country-restrictions',
                old: 'International residents (GB, FR)',
                updated: 'International residents (GB, DE)',
              },
            ],
          },
        ]),
      );
    });
  });

  describe('Basic information', () => {
    describe('SSN', () => {
      it('should show when SSN changes from full to last 4', () => {
        const oldPlaybook = getOnboardingConfiguration({
          mustCollectData: ['ssn9'],
          optionalData: [],
        });
        const updatedPlaybook = getOnboardingConfiguration({
          mustCollectData: ['ssn4'],
          optionalData: [],
        });
        expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
          expect.arrayContaining([
            {
              label: 'Basic information',
              changes: [
                {
                  alias: 'ssn-change-9-to-4',
                  old: 'SSN (Full)',
                  updated: 'SSN (Last 4) ',
                },
              ],
            },
          ]),
        );
      });

      it('should show when SSN changes from last 4 to full', () => {
        const oldPlaybook = getOnboardingConfiguration({
          mustCollectData: ['ssn4'],
          optionalData: [],
        });
        const updatedPlaybook = getOnboardingConfiguration({
          mustCollectData: ['ssn9'],
          optionalData: [],
        });
        expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
          expect.arrayContaining([
            {
              label: 'Basic information',
              changes: [
                {
                  alias: 'ssn-change-4-to-9',
                  old: 'SSN (Last 4)',
                  updated: 'SSN (Full)',
                },
              ],
            },
          ]),
        );
      });

      it('should show when full SSN changes from required to optional', () => {
        const oldPlaybook = getOnboardingConfiguration({
          mustCollectData: ['ssn9'],
          optionalData: [],
        });
        const updatedPlaybook = getOnboardingConfiguration({
          mustCollectData: [],
          optionalData: ['ssn9'],
        });
        expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
          expect.arrayContaining([
            {
              label: 'Basic information',
              changes: [
                {
                  alias: 'ssn-9-required-to-optional',
                  old: 'SSN (Full) required',
                  updated: 'SSN (Full) optional',
                },
              ],
            },
          ]),
        );
      });

      it('should show when full SSN required changes to last 4 optional', () => {
        const oldPlaybook = getOnboardingConfiguration({
          mustCollectData: ['ssn9'],
          optionalData: [],
        });
        const updatedPlaybook = getOnboardingConfiguration({
          mustCollectData: [],
          optionalData: ['ssn4'],
        });
        expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
          expect.arrayContaining([
            {
              label: 'Basic information',
              changes: [
                {
                  alias: 'ssn-9-required-to-4-optional',
                  old: 'SSN (Full) required',
                  updated: 'SSN (Last 4) optional',
                },
              ],
            },
          ]),
        );
      });

      it('should show when last 4 SSN changes from required to optional', () => {
        const oldPlaybook = getOnboardingConfiguration({
          mustCollectData: ['ssn4'],
          optionalData: [],
        });
        const updatedPlaybook = getOnboardingConfiguration({
          mustCollectData: [],
          optionalData: ['ssn4'],
        });
        expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
          expect.arrayContaining([
            {
              label: 'Basic information',
              changes: [
                {
                  alias: 'ssn-4-required-to-optional',
                  old: 'SSN (Last 4) required',
                  updated: 'SSN (Last 4) optional',
                },
              ],
            },
          ]),
        );
      });

      it('should show when full SSN required is removed', () => {
        const oldPlaybook = getOnboardingConfiguration({
          mustCollectData: ['ssn9'],
          optionalData: [],
        });
        const updatedPlaybook = getOnboardingConfiguration({
          mustCollectData: [],
          optionalData: [],
        });
        expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
          expect.arrayContaining([
            {
              label: 'Basic information',
              changes: [
                {
                  alias: 'ssn-9-required-to-not-collected',
                  old: 'SSN (Full) required',
                  updated: 'SSN (Full) is not collected',
                },
              ],
            },
          ]),
        );
      });

      it('should show when last 4 SSN required is removed', () => {
        const oldPlaybook = getOnboardingConfiguration({
          mustCollectData: ['ssn4'],
          optionalData: [],
        });
        const updatedPlaybook = getOnboardingConfiguration({
          mustCollectData: [],
          optionalData: [],
        });
        expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
          expect.arrayContaining([
            {
              label: 'Basic information',
              changes: [
                {
                  alias: 'ssn-4-required-to-not-collected',
                  old: 'SSN (Last 4) required',
                  updated: 'SSN (Last 4) is not collected',
                },
              ],
            },
          ]),
        );
      });

      it('should show when US Tax ID required is removed', () => {
        const oldPlaybook = getOnboardingConfiguration({
          mustCollectData: ['us_tax_id'],
          optionalData: [],
        });
        const updatedPlaybook = getOnboardingConfiguration({
          mustCollectData: [],
          optionalData: [],
        });
        expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
          expect.arrayContaining([
            {
              label: 'Basic information',
              changes: [
                {
                  alias: 'us-tax-id-required-to-not-collected',
                  old: 'US Tax ID required',
                  updated: 'US Tax ID is not collected',
                },
              ],
            },
          ]),
        );
      });

      it('should show when US Tax ID is added as required', () => {
        const oldPlaybook = getOnboardingConfiguration({
          mustCollectData: [],
          optionalData: [],
        });
        const updatedPlaybook = getOnboardingConfiguration({
          mustCollectData: ['us_tax_id'],
          optionalData: [],
        });
        expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
          expect.arrayContaining([
            {
              label: 'Basic information',
              changes: [
                {
                  alias: 'us-tax-id-not-collected-to-required',
                  old: 'US Tax ID is not collected',
                  updated: 'US Tax ID required',
                },
              ],
            },
          ]),
        );
      });
    });

    describe('Legal status', () => {
      it('should show when legal status required is removed', () => {
        const oldPlaybook = getOnboardingConfiguration({
          mustCollectData: ['us_legal_status'],
          optionalData: [],
        });
        const updatedPlaybook = getOnboardingConfiguration({
          mustCollectData: [],
          optionalData: [],
        });
        expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
          expect.arrayContaining([
            {
              label: 'Basic information',
              changes: [
                {
                  alias: 'legal-status-required-to-not-collected',
                  old: 'US Legal Status required',
                  updated: 'US Legal Status is not collected',
                },
              ],
            },
          ]),
        );
      });

      it('should show when legal status is added as required', () => {
        const oldPlaybook = getOnboardingConfiguration({
          mustCollectData: [],
          optionalData: [],
        });
        const updatedPlaybook = getOnboardingConfiguration({
          mustCollectData: ['us_legal_status'],
          optionalData: [],
        });
        expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
          expect.arrayContaining([
            {
              label: 'Basic information',
              changes: [
                {
                  alias: 'legal-status-not-collected-to-required',
                  old: 'US Legal Status is not collected',
                  updated: 'US Legal Status required',
                },
              ],
            },
          ]),
        );
      });
    });
  });

  describe('Investor questions', () => {
    it('should show when investor questions required is removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        mustCollectData: ['investor_profile'],
        optionalData: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        mustCollectData: [],
        optionalData: [],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Investor profile questions',
            changes: [
              {
                alias: 'investor-questions-required-to-not-collected',
                old: 'Investor questions required',
                updated: 'Investor questions are not collected',
              },
            ],
          },
        ]),
      );
    });

    it('should show when investor questions is added as required', () => {
      const oldPlaybook = getOnboardingConfiguration({
        mustCollectData: [],
        optionalData: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        mustCollectData: ['investor_profile'],
        optionalData: [],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Investor profile questions',
            changes: [
              {
                alias: 'investor-questions-not-collected-to-required',
                old: 'Investor questions are not collected',
                updated: 'Investor questions required',
              },
            ],
          },
        ]),
      );
    });
  });

  describe('Authentication method', () => {
    it('should show when auth methods are updated from SMS to Email', () => {
      const oldPlaybook = getOnboardingConfiguration({
        requiredAuthMethods: ['phone'],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        requiredAuthMethods: ['email'],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Authentication methods',
            changes: [
              {
                alias: 'auth-methods-list-updated',
                old: 'SMS',
                updated: 'Email',
              },
            ],
          },
        ]),
      );
    });

    it('should show when auth methods are updated from single to multiple methods', () => {
      const oldPlaybook = getOnboardingConfiguration({
        requiredAuthMethods: ['phone'],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        requiredAuthMethods: ['phone', 'email'],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Authentication methods',
            changes: [
              {
                alias: 'auth-methods-list-updated',
                old: 'SMS',
                updated: 'SMS, Email',
              },
            ],
          },
        ]),
      );
    });

    it('should show when auth methods are reduced to single method', () => {
      const oldPlaybook = getOnboardingConfiguration({
        requiredAuthMethods: ['phone', 'email'],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        requiredAuthMethods: ['phone'],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Authentication methods',
            changes: [
              {
                alias: 'auth-methods-list-updated',
                old: 'SMS, Email',
                updated: 'SMS',
              },
            ],
          },
        ]),
      );
    });
  });

  describe('Document changes', () => {
    it('should show when proof of address is added', () => {
      const oldPlaybook = getOnboardingConfiguration({
        documentsToCollect: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        documentsToCollect: [{ kind: 'proof_of_address', data: { requiresHumanReview: true } }],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Document requirements',
            changes: [
              {
                alias: 'proof-of-address-added',
                old: 'Proof of address not collected',
                updated: 'Proof of address collected',
              },
            ],
          },
        ]),
      );
    });

    it('should show when proof of address is removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        documentsToCollect: [{ kind: 'proof_of_address', data: { requiresHumanReview: true } }],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        documentsToCollect: [],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Document requirements',
            changes: [
              {
                alias: 'proof-of-address-removed',
                old: 'Proof of address collected',
                updated: 'Proof of address not collected',
              },
            ],
          },
        ]),
      );
    });

    it('should show when proof of address review requirement changes', () => {
      const oldPlaybook = getOnboardingConfiguration({
        documentsToCollect: [{ kind: 'proof_of_address', data: { requiresHumanReview: false } }],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        documentsToCollect: [{ kind: 'proof_of_address', data: { requiresHumanReview: true } }],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Document requirements',
            changes: [
              {
                alias: 'proof-of-address-review-requirement-changed',
                old: 'Proof of address does not require human review',
                updated: 'Proof of address requires human review',
              },
            ],
          },
        ]),
      );
    });

    it('should show when proof of SSN is added', () => {
      const oldPlaybook = getOnboardingConfiguration({
        documentsToCollect: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        documentsToCollect: [{ kind: 'proof_of_ssn', data: { requiresHumanReview: true } }],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Document requirements',
            changes: [
              {
                alias: 'proof-of-ssn-added',
                old: 'Proof of SSN not collected',
                updated: 'Proof of SSN collected',
              },
            ],
          },
        ]),
      );
    });

    it('should show when proof of SSN is removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        documentsToCollect: [{ kind: 'proof_of_ssn', data: { requiresHumanReview: true } }],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        documentsToCollect: [],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Document requirements',
            changes: [
              {
                alias: 'proof-of-ssn-removed',
                old: 'Proof of SSN collected',
                updated: 'Proof of SSN not collected',
              },
            ],
          },
        ]),
      );
    });

    it('should show when proof of SSN review requirement changes', () => {
      const oldPlaybook = getOnboardingConfiguration({
        documentsToCollect: [{ kind: 'proof_of_ssn', data: { requiresHumanReview: false } }],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        documentsToCollect: [{ kind: 'proof_of_ssn', data: { requiresHumanReview: true } }],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Document requirements',
            changes: [
              {
                alias: 'proof-of-ssn-review-requirement-changed',
                old: 'Proof of SSN does not require human review',
                updated: 'Proof of SSN requires human review',
              },
            ],
          },
        ]),
      );
    });

    it('should show when custom document is added', () => {
      const oldPlaybook = getOnboardingConfiguration({
        documentsToCollect: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        documentsToCollect: [
          {
            kind: 'custom',
            data: {
              identifier: 'document.custom.*',
              name: 'test',
              requiresHumanReview: false,
              uploadSettings: 'prefer_capture',
            },
          },
        ],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Document requirements',
            changes: [
              {
                alias: 'custom-doc-added-document.custom.*',
                old: 'Custom document "document.custom.*" not collected',
                updated: 'Custom document "document.custom.*" collected',
              },
            ],
          },
        ]),
      );
    });

    it('should show when custom document is removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        documentsToCollect: [
          {
            kind: 'custom',
            data: {
              identifier: 'document.custom.*',
              name: 'test',
              requiresHumanReview: false,
              uploadSettings: 'prefer_capture',
            },
          },
        ],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        documentsToCollect: [],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Document requirements',
            changes: [
              {
                alias: 'custom-doc-removed-document.custom.*',
                old: 'Custom document "document.custom.*" collected',
                updated: 'Custom document "document.custom.*" not collected',
              },
            ],
          },
        ]),
      );
    });

    it('should show multiple document requirement changes together', () => {
      const oldPlaybook = getOnboardingConfiguration({
        documentsToCollect: [
          {
            kind: 'proof_of_address',
            data: {
              requiresHumanReview: false,
            },
          },
          {
            kind: 'custom',
            data: {
              identifier: 'document.custom.*',
              name: 'test1',
              requiresHumanReview: false,
              uploadSettings: 'prefer_capture',
            },
          },
        ],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        documentsToCollect: [
          {
            kind: 'proof_of_ssn',
            data: {
              requiresHumanReview: false,
            },
          },
          {
            kind: 'custom',
            data: {
              identifier: 'document.custom.*',
              name: 'test2',
              requiresHumanReview: false,
              uploadSettings: 'prefer_capture',
            },
          },
        ],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Document requirements',
            changes: [
              {
                alias: 'proof-of-address-removed',
                old: 'Proof of address collected',
                updated: 'Proof of address not collected',
              },
              {
                alias: 'proof-of-ssn-added',
                old: 'Proof of SSN not collected',
                updated: 'Proof of SSN collected',
              },
              {
                alias: 'custom-doc-name-updated-document.custom.*',
                old: 'Custom document "document.custom.*" name: "test1"',
                updated: 'Custom document "document.custom.*" name: "test2"',
              },
            ],
          },
        ]),
      );
    });
  });

  describe('Identity documents', () => {
    it('should show when global document types are added', () => {
      const oldPlaybook = getOnboardingConfiguration({
        documentTypesAndCountries: {
          global: ['passport'],
          countrySpecific: {},
        },
      });
      const updatedPlaybook = getOnboardingConfiguration({
        documentTypesAndCountries: {
          global: ['passport', 'drivers_license'],
          countrySpecific: {},
        },
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Document Types and Countries',
            changes: [
              {
                alias: 'global-document-requirement-added',
                old: 'No global document requirement',
                updated: 'Added drivers_license as global document requirement',
              },
            ],
          },
        ]),
      );
    });

    it('should show when global document types are removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        documentTypesAndCountries: {
          global: ['passport', 'drivers_license', 'id_card'],
          countrySpecific: {},
        },
      });
      const updatedPlaybook = getOnboardingConfiguration({
        documentTypesAndCountries: {
          global: ['passport'],
          countrySpecific: {},
        },
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Document Types and Countries',
            changes: [
              {
                alias: 'global-doc-removed',
                old: 'drivers_license was required globally',
                updated: 'Removed global document requirement',
              },
              {
                alias: 'global-doc-removed',
                old: 'id_card was required globally',
                updated: 'Removed global document requirement',
              },
            ],
          },
        ]),
      );
    });

    it('should show when country specific document types are added', () => {
      const oldPlaybook = getOnboardingConfiguration({
        documentTypesAndCountries: {
          global: ['passport'],
          countrySpecific: {},
        },
      });
      const updatedPlaybook = getOnboardingConfiguration({
        documentTypesAndCountries: {
          global: ['passport'],
          countrySpecific: {
            US: ['drivers_license'],
          },
        },
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Document Types and Countries',
            changes: [
              {
                alias: 'country-added',
                old: 'No requirements for US',
                updated: 'Added US (drivers_license) to supported countries',
              },
            ],
          },
        ]),
      );
    });

    it('should show when country specific document types are removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        documentTypesAndCountries: {
          global: ['passport'],
          countrySpecific: {
            US: ['drivers_license'],
            GB: ['id_card'],
          },
        },
      });
      const updatedPlaybook = getOnboardingConfiguration({
        documentTypesAndCountries: {
          global: ['passport'],
          countrySpecific: {},
        },
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Document Types and Countries',
            changes: [
              {
                alias: 'country-removed',
                old: 'US was supported',
                updated: 'Removed US from supported countries',
              },
              {
                alias: 'country-removed',
                old: 'GB was supported',
                updated: 'Removed GB from supported countries',
              },
            ],
          },
        ]),
      );
    });

    it('should show when country specific document types are modified', () => {
      const oldPlaybook = getOnboardingConfiguration({
        documentTypesAndCountries: {
          global: ['passport'],
          countrySpecific: {
            US: ['drivers_license'],
          },
        },
      });
      const updatedPlaybook = getOnboardingConfiguration({
        documentTypesAndCountries: {
          global: ['passport'],
          countrySpecific: {
            US: ['id_card'],
          },
        },
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Document Types and Countries',
            changes: [
              {
                alias: 'country-docs-modified',
                old: 'US required: drivers_license',
                updated: 'US requires: id_card',
              },
            ],
          },
        ]),
      );
    });
  });

  describe('verification checks', () => {
    it('should show when KYC verification is added', () => {
      const oldPlaybook = getOnboardingConfiguration({
        verificationChecks: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        verificationChecks: [{ kind: 'kyc', data: {} }],
      });

      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Verification checks',
            changes: [
              {
                alias: 'kyc-verification-added',
                old: 'KYC verification not required',
                updated: 'KYC verification required',
              },
            ],
          },
        ]),
      );
    });

    it('should show when AML settings are modified', () => {
      const oldPlaybook = getOnboardingConfiguration({
        verificationChecks: [
          {
            kind: 'aml',
            data: {
              adverseMedia: true,
              adverseMediaLists: ['financial_crime', 'fraud'],
              ofac: true,
              pep: false,
              matchKind: 'exact_name',
              continuousMonitoring: false,
            },
          },
        ],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        verificationChecks: [
          {
            kind: 'aml',
            data: {
              adverseMedia: true,
              adverseMediaLists: ['financial_crime', 'fraud', 'cyber_crime'],
              ofac: false,
              pep: true,
              matchKind: 'fuzzy_high',
              continuousMonitoring: false,
            },
          },
        ],
      });

      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Verification checks',
            changes: [
              {
                alias: 'aml-adverse-media-updated',
                old: 'Adverse media enabled (financial_crime, fraud)',
                updated: 'Adverse media enabled (financial_crime, fraud, cyber_crime)',
              },
              {
                alias: 'aml-ofac-updated',
                old: 'OFAC enabled',
                updated: 'OFAC disabled',
              },
              {
                alias: 'aml-pep-updated',
                old: 'PEP disabled',
                updated: 'PEP enabled',
              },
              {
                alias: 'aml-match-kind-updated',
                old: 'Match kind: exact_name',
                updated: 'Match kind: fuzzy_high',
              },
            ],
          },
        ]),
      );
    });

    it('should show when Neuro ID verification is added', () => {
      const oldPlaybook = getOnboardingConfiguration({
        verificationChecks: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        verificationChecks: [{ kind: 'neuro_id', data: {} }],
      });

      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Verification checks',
            changes: [
              {
                alias: 'neuro-id-added',
                old: 'Neuro ID verification disabled',
                updated: 'Neuro ID verification enabled',
              },
            ],
          },
        ]),
      );
    });

    it('should show when Neuro ID verification is removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        verificationChecks: [{ kind: 'neuro_id', data: {} }],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        verificationChecks: [],
      });

      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Verification checks',
            changes: [
              {
                alias: 'neuro-id-removed',
                old: 'Neuro ID verification enabled',
                updated: 'Neuro ID verification disabled',
              },
            ],
          },
        ]),
      );
    });

    it('should show when Sentilink verification is added', () => {
      const oldPlaybook = getOnboardingConfiguration({
        verificationChecks: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        verificationChecks: [{ kind: 'sentilink', data: {} }],
      });

      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Verification checks',
            changes: [
              {
                alias: 'sentilink-added',
                old: 'Sentilink verification disabled',
                updated: 'Sentilink verification enabled',
              },
            ],
          },
        ]),
      );
    });

    it('should show when Sentilink verification is removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        verificationChecks: [{ kind: 'sentilink', data: {} }],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        verificationChecks: [],
      });

      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Verification checks',
            changes: [
              {
                alias: 'sentilink-removed',
                old: 'Sentilink verification enabled',
                updated: 'Sentilink verification disabled',
              },
            ],
          },
        ]),
      );
    });
  });
});
