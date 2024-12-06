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

  describe('Business information', () => {
    it('should show when business name required is removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        mustCollectData: ['business_name'],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        mustCollectData: [],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Business information',
            changes: [
              {
                alias: 'business-name-required-to-not-collected',
                old: 'Business name required',
                updated: 'Business name is not collected',
              },
            ],
          },
        ]),
      );
    });

    it('should show when business name is added as required', () => {
      const oldPlaybook = getOnboardingConfiguration({
        mustCollectData: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        mustCollectData: ['business_name'],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Business information',
            changes: [
              {
                alias: 'business-name-not-collected-to-required',
                old: 'Business name is not collected',
                updated: 'Business name required',
              },
            ],
          },
        ]),
      );
    });

    it('should show when business address required is removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        mustCollectData: ['business_address'],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        mustCollectData: [],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Business information',
            changes: [
              {
                alias: 'business-address-required-to-not-collected',
                old: 'Business address required',
                updated: 'Business address is not collected',
              },
            ],
          },
        ]),
      );
    });

    it('should show when business address is added as required', () => {
      const oldPlaybook = getOnboardingConfiguration({
        mustCollectData: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        mustCollectData: ['business_address'],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Business information',
            changes: [
              {
                alias: 'business-address-not-collected-to-required',
                old: 'Business address is not collected',
                updated: 'Business address required',
              },
            ],
          },
        ]),
      );
    });

    it('should show when TIN required is removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        mustCollectData: ['business_tin'],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        mustCollectData: [],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Business information',
            changes: [
              {
                alias: 'business-tin-required-to-not-collected',
                old: 'Business TIN required',
                updated: 'Business TIN is not collected',
              },
            ],
          },
        ]),
      );
    });

    it('should show when TIN is added as required', () => {
      const oldPlaybook = getOnboardingConfiguration({
        mustCollectData: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        mustCollectData: ['business_tin'],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Business information',
            changes: [
              {
                alias: 'business-tin-not-collected-to-required',
                old: 'Business TIN is not collected',
                updated: 'Business TIN required',
              },
            ],
          },
        ]),
      );
    });

    it('should show when business phone number required is removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        mustCollectData: ['business_phone_number'],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        mustCollectData: [],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Business information',
            changes: [
              {
                alias: 'business-phone-required-to-not-collected',
                old: 'Business phone number required',
                updated: 'Business phone number is not collected',
              },
            ],
          },
        ]),
      );
    });

    it('should show when business phone number is added as required', () => {
      const oldPlaybook = getOnboardingConfiguration({
        mustCollectData: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        mustCollectData: ['business_phone_number'],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Business information',
            changes: [
              {
                alias: 'business-phone-not-collected-to-required',
                old: 'Business phone number is not collected',
                updated: 'Business phone number required',
              },
            ],
          },
        ]),
      );
    });

    it('should show when business website required is removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        mustCollectData: ['business_website'],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        mustCollectData: [],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Business information',
            changes: [
              {
                alias: 'business-website-required-to-not-collected',
                old: 'Business website required',
                updated: 'Business website is not collected',
              },
            ],
          },
        ]),
      );
    });

    it('should show when business website is added as required', () => {
      const oldPlaybook = getOnboardingConfiguration({
        mustCollectData: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        mustCollectData: ['business_website'],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Business information',
            changes: [
              {
                alias: 'business-website-not-collected-to-required',
                old: 'Business website is not collected',
                updated: 'Business website required',
              },
            ],
          },
        ]),
      );
    });

    it('should show when business type required is removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        mustCollectData: ['business_corporation_type'],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        mustCollectData: [],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Business information',
            changes: [
              {
                alias: 'business-type-required-to-not-collected',
                old: 'Business type required',
                updated: 'Business type is not collected',
              },
            ],
          },
        ]),
      );
    });

    it('should show when business type is added as required', () => {
      const oldPlaybook = getOnboardingConfiguration({
        mustCollectData: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        mustCollectData: ['business_corporation_type'],
      });
      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Business information',
            changes: [
              {
                alias: 'business-type-not-collected-to-required',
                old: 'Business type is not collected',
                updated: 'Business type required',
              },
            ],
          },
        ]),
      );
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

  describe('Business documents', () => {
    it('should show when custom business documents are added', () => {
      const oldPlaybook = getOnboardingConfiguration({
        documentsToCollect: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        documentsToCollect: [
          {
            kind: 'custom',
            data: {
              identifier: 'document.custom.*',
              name: 'Business License',
              description: 'Business license document',
              requiresHumanReview: true,
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

    it('should show when custom business documents are removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        documentsToCollect: [
          {
            kind: 'custom',
            data: {
              identifier: 'document.custom.*',
              name: 'Business License',
              description: 'Business license document',
              requiresHumanReview: true,
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

    it('should show when custom business document properties are modified', () => {
      const oldPlaybook = getOnboardingConfiguration({
        documentsToCollect: [
          {
            kind: 'custom',
            data: {
              identifier: 'document.custom.*',
              name: 'Business License',
              description: 'Old description',
              requiresHumanReview: false,
              uploadSettings: 'prefer_capture',
            },
          },
        ],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        documentsToCollect: [
          {
            kind: 'custom',
            data: {
              identifier: 'document.custom.*',
              name: 'Updated Business License',
              description: 'New description',
              requiresHumanReview: true,
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
                alias: 'custom-doc-name-updated-document.custom.*',
                old: 'Custom document "document.custom.*" name: "Business License"',
                updated: 'Custom document "document.custom.*" name: "Updated Business License"',
              },
              {
                alias: 'custom-doc-description-changed-document.custom.*',
                old: 'Custom document description: "Old description"',
                updated: 'Custom document description: "New description"',
              },
              {
                alias: 'custom-doc-review-changed-document.custom.*',
                old: 'Custom document does not require human review',
                updated: 'Custom document requires human review',
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

  describe('Verification checks', () => {
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

    it('should show when KYB verification is added', () => {
      const oldPlaybook = getOnboardingConfiguration({
        verificationChecks: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        verificationChecks: [{ kind: 'kyb', data: { einOnly: false } }],
      });

      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Verification checks',
            changes: [
              {
                alias: 'kyb-verification-added',
                old: 'KYB verification not required',
                updated: 'KYB verification required',
              },
            ],
          },
        ]),
      );
    });

    it('should show when KYB verification is removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        verificationChecks: [{ kind: 'kyb', data: { einOnly: false } }],
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
                alias: 'kyb-verification-removed',
                old: 'KYB verification required',
                updated: 'KYB verification not required',
              },
            ],
          },
        ]),
      );
    });

    it('should show when KYB EIN only setting is changed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        verificationChecks: [{ kind: 'kyb', data: { einOnly: false } }],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        verificationChecks: [{ kind: 'kyb', data: { einOnly: true } }],
      });

      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Verification checks',
            changes: [
              {
                alias: 'kyb-ein-only-updated',
                old: 'Full KYB verification',
                updated: 'EIN only verification',
              },
            ],
          },
        ]),
      );
    });

    it('should show when Business AML verification is added', () => {
      const oldPlaybook = getOnboardingConfiguration({
        verificationChecks: [],
      });
      const updatedPlaybook = getOnboardingConfiguration({
        verificationChecks: [{ kind: 'business_aml', data: {} }],
      });

      expect(createDiff(oldPlaybook, updatedPlaybook)).toEqual(
        expect.arrayContaining([
          {
            label: 'Verification checks',
            changes: [
              {
                alias: 'business-aml-verification-added',
                old: 'Business AML verification not required',
                updated: 'Business AML verification required',
              },
            ],
          },
        ]),
      );
    });

    it('should show when Business AML verification is removed', () => {
      const oldPlaybook = getOnboardingConfiguration({
        verificationChecks: [{ kind: 'business_aml', data: {} }],
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
                alias: 'business-aml-verification-removed',
                old: 'Business AML verification required',
                updated: 'Business AML verification not required',
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
