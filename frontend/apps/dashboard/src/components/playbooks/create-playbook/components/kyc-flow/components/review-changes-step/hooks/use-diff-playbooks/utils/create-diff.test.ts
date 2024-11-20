import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import createDiff from './create-diff';

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
                alias: 'name-updated',
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
                alias: 'us-to-international',
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
                alias: 'us-to-international',
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
                alias: 'international-to-us',
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
                alias: 'add-us-territory',
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
                alias: 'remove-us-territory',
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
                alias: 'add-country-restrictions',
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
                alias: 'remove-country-restrictions',
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
                alias: 'update-country-restrictions',
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
                  alias: 'ssn9-is-ssn4',
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
                  alias: 'ssn4-is-ssn9',
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
                  alias: 'ssn-required-to-optional',
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
                  alias: 'ssn-required-to-optional',
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
                  alias: 'ssn-required-to-optional',
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
                  alias: 'ssn-9-skipped',
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
                  alias: 'ssn-4-skipped',
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
                  alias: 'us-tax-id-skipped',
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
                  alias: 'us-tax-id-required',
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
                  alias: 'legal-status-skipped',
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
                  alias: 'legal-status-required',
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
                alias: 'investor-questions-skipped',
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
                alias: 'investor-questions-required',
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
                alias: 'auth-methods-updated',
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
                alias: 'auth-methods-updated',
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
                alias: 'auth-methods-updated',
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
                alias: 'poa-added',
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
                alias: 'poa-removed',
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
                alias: 'poa-review-changed',
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
                alias: 'possn-added',
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
                alias: 'possn-removed',
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
                alias: 'possn-review-changed',
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
                alias: 'custom-doc-added',
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
                alias: 'custom-doc-removed',
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
                alias: 'poa-removed',
                old: 'Proof of address collected',
                updated: 'Proof of address not collected',
              },
              {
                alias: 'possn-added',
                old: 'Proof of SSN not collected',
                updated: 'Proof of SSN collected',
              },
              {
                alias: 'custom-doc-name-updated',
                old: 'Custom document "document.custom.*" name: "test1"',
                updated: 'Custom document "document.custom.*" name: "test2"',
              },
            ],
          },
        ]),
      );
    });
  });
});
