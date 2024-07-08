import type { CountryRecord } from '@onefootprint/global-constants';
import { COUNTRIES } from '@onefootprint/global-constants';
import type { CollectedDataOption } from '@onefootprint/types';
import {
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import {
  CountryRestriction,
  Personal,
  PlaybookKind,
  defaultBusinessInformation,
  defaultNameFormData,
  defaultPlaybookValuesKYB,
  defaultPlaybookValuesKYC,
} from 'src/pages/playbooks/utils/machine/types';

import processPlaybook, { getMandatoryAndOptionalTaxIdFields } from './process-playbook';

const setsEqual = (a: CollectedDataOption[], b: CollectedDataOption[]): boolean =>
  a.length === b.length && a.every(i => b.includes(i));

describe('processPlaybook', () => {
  describe('KYC', () => {
    it('should return required KYC fields in mustCollectData regardless of playbook values', () => {
      const { mustCollectData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYC,
          personal: {
            ...defaultPlaybookValuesKYC.personal,
            [CollectedKycDataOption.email]: false,
            [CollectedKycDataOption.phoneNumber]: false,
            [CollectedKycDataOption.dob]: false,
            [CollectedKycDataOption.address]: false,
          },
        },
        kind: PlaybookKind.Kyc,
        nameForm: defaultNameFormData,
        verificationChecks: {},
      });

      expect(mustCollectData).toContain(CollectedKycDataOption.email);
      expect(mustCollectData).toContain(CollectedKycDataOption.name);
      expect(mustCollectData).toContain(CollectedKycDataOption.dob);
      expect(mustCollectData).toContain(CollectedKycDataOption.address);
    });

    it('should include full SSN in optional data but not mustCollectData if it is optional', () => {
      const { mustCollectData, optionalData, canAccessData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYC,
          personal: {
            ...defaultPlaybookValuesKYC.personal,
            ssn: true,
            ssnOptional: true,
            ssnKind: CollectedKycDataOption.ssn9,
          },
        },
        kind: PlaybookKind.Kyc,
        nameForm: defaultNameFormData,
        verificationChecks: {},
      });

      expect(mustCollectData).not.toContain(CollectedKycDataOption.ssn9);
      expect(mustCollectData).not.toContain(CollectedKycDataOption.ssn4);
      expect(optionalData).toContain(CollectedKycDataOption.ssn9);
      expect(optionalData).not.toContain(CollectedKycDataOption.ssn4);
      expect(canAccessData).toContain(CollectedKycDataOption.ssn9);
      expect(setsEqual(canAccessData, mustCollectData.concat(optionalData))).toBeTruthy();
    });

    it('should include SSN last 4 in optional data but not mustCollectData if it is optional', () => {
      const { mustCollectData, optionalData, canAccessData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYC,
          personal: {
            ...defaultPlaybookValuesKYC.personal,
            ssn: true,
            ssnOptional: true,
            ssnKind: CollectedKycDataOption.ssn4,
          },
        },
        kind: PlaybookKind.Kyc,
        nameForm: defaultNameFormData,
        verificationChecks: {},
      });

      expect(mustCollectData).not.toContain(CollectedKycDataOption.ssn4);
      expect(mustCollectData).not.toContain(CollectedKycDataOption.ssn9);
      expect(optionalData).toContain(CollectedKycDataOption.ssn4);
      expect(optionalData).not.toContain(CollectedKycDataOption.ssn9);
      expect(canAccessData).toContain(CollectedKycDataOption.ssn4);
      expect(canAccessData).not.toContain(CollectedKycDataOption.ssn9);
      expect(setsEqual(canAccessData, mustCollectData.concat(optionalData))).toBeTruthy();
    });

    it('should include full SSN in mustCollectData if required', () => {
      const { mustCollectData, optionalData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYC,
          personal: {
            ...defaultPlaybookValuesKYC.personal,
            ssn: true,
            ssnKind: CollectedKycDataOption.ssn9,
          },
        },
        kind: PlaybookKind.Kyc,
        nameForm: defaultNameFormData,
        verificationChecks: {},
      });

      expect(mustCollectData).toContain(CollectedKycDataOption.ssn9);
      expect(mustCollectData).not.toContain(CollectedKycDataOption.ssn4);
      expect(optionalData).not.toContain(CollectedKycDataOption.ssn9);
      expect(optionalData).not.toContain(CollectedKycDataOption.ssn4);
    });

    it('should SSN last4 in mustCollectData if required', () => {
      const { mustCollectData, optionalData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYC,
          personal: {
            ...defaultPlaybookValuesKYC.personal,
            ssn: true,
            ssnKind: CollectedKycDataOption.ssn4,
          },
        },
        kind: PlaybookKind.Kyc,
        nameForm: defaultNameFormData,
        verificationChecks: {},
      });

      expect(mustCollectData).toContain(CollectedKycDataOption.ssn4);
      expect(mustCollectData).not.toContain(CollectedKycDataOption.ssn9);
      expect(optionalData).not.toContain(CollectedKycDataOption.ssn4);
      expect(optionalData).not.toContain(CollectedKycDataOption.ssn9);
    });

    it('should include investor profile in mustCollectData if required', () => {
      const { mustCollectData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYC,
          personal: {
            ...defaultPlaybookValuesKYC.personal,
          },
          [CollectedInvestorProfileDataOption.investorProfile]: true,
        },
        kind: PlaybookKind.Kyc,
        nameForm: defaultNameFormData,
        verificationChecks: {},
      });

      expect(mustCollectData).toContain(CollectedInvestorProfileDataOption.investorProfile);
    });

    it('should handle canAccessData as expected for default KYC values', () => {
      const { canAccessData, mustCollectData } = processPlaybook({
        playbook: defaultPlaybookValuesKYC,
        kind: PlaybookKind.Kyc,
        nameForm: defaultNameFormData,
        verificationChecks: {},
      });

      expect(canAccessData).toContain(CollectedKycDataOption.email);
      expect(canAccessData).toContain(CollectedKycDataOption.phoneNumber);
      expect(canAccessData).toContain(CollectedKycDataOption.name);
      expect(canAccessData).toContain(CollectedKycDataOption.dob);
      expect(canAccessData).toContain(CollectedKycDataOption.address);
      expect(canAccessData).not.toContain(CollectedKycDataOption.ssn4);
      expect(canAccessData).toContain(CollectedKycDataOption.ssn9);
      // tk document case
      expect(canAccessData).not.toContain(CollectedInvestorProfileDataOption.investorProfile);
      expect(setsEqual(canAccessData, mustCollectData)).toBeTruthy();
    });

    it('should handle single id doc type correctly without selfie', () => {
      const { mustCollectData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYC,
          personal: {
            ...defaultPlaybookValuesKYC.personal,
            docs: {
              ...defaultPlaybookValuesKYC.personal.docs,
              global: [SupportedIdDocTypes.passport],
              selfie: false,
            },
          },
        },
        kind: PlaybookKind.Kyc,
        nameForm: defaultNameFormData,
        verificationChecks: {},
      });

      expect(mustCollectData).toContain('document');
    });

    it('should handle multiple id doc types correctly without selfie', () => {
      const { mustCollectData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYC,
          personal: {
            ...defaultPlaybookValuesKYC.personal,
            docs: {
              ...defaultPlaybookValuesKYC.personal.docs,
              global: [SupportedIdDocTypes.passport, SupportedIdDocTypes.driversLicense],
              selfie: false,
            },
          },
        },
        kind: PlaybookKind.Kyc,
        nameForm: defaultNameFormData,
        verificationChecks: {},
      });

      expect(mustCollectData).toContain('document');
    });

    it('should handle single id doc type correctly with selfie', () => {
      const { mustCollectData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYC,
          personal: {
            ...defaultPlaybookValuesKYC.personal,
            docs: {
              ...defaultPlaybookValuesKYC.personal.docs,
              global: [SupportedIdDocTypes.passport],
              selfie: true,
            },
          },
        },
        kind: PlaybookKind.Kyc,
        nameForm: defaultNameFormData,
        verificationChecks: {},
      });

      expect(mustCollectData).toContain('document_and_selfie');
    });

    it('should handle multiple id doc types correctly with selfie', () => {
      const { mustCollectData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYC,
          personal: {
            ...defaultPlaybookValuesKYC.personal,
            docs: {
              ...defaultPlaybookValuesKYC.personal.docs,
              global: [SupportedIdDocTypes.passport, SupportedIdDocTypes.driversLicense],
              selfie: true,
            },
          },
        },
        kind: PlaybookKind.Kyc,
        nameForm: defaultNameFormData,
        verificationChecks: {},
      });

      expect(mustCollectData).toContain('document_and_selfie');
    });

    it('should process case where doc flow is first correctly', () => {
      const { isDocFirstFlow } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYC,
          personal: {
            ...defaultPlaybookValuesKYC.personal,
            docs: {
              ...defaultPlaybookValuesKYC.personal.docs,
              global: [SupportedIdDocTypes.passport, SupportedIdDocTypes.driversLicense],
              selfie: true,
              idDocFirst: true,
            },
          },
        },
        kind: PlaybookKind.Kyc,
        nameForm: defaultNameFormData,
        verificationChecks: {},
      });

      expect(isDocFirstFlow).toBe(true);
    });

    // it('should process default case where doc flow is not specified correctly', () => {
    //   const { isDocFirstFlow } = processPlaybook({
    //     playbook: {
    //       ...defaultPlaybookValuesKYC,
    //       personal: {
    //         ...defaultPlaybookValuesKYC.personal,
    //         docs: {
    //           ...defaultPlaybookValuesKYC.personal.docs,
    //           global: [SupportedIdDocTypes.passport, SupportedIdDocTypes.driversLicense],
    //           selfie: true,
    //         },
    //       },
    //     },
    //     kind: PlaybookKind.Kyc,
    //     nameForm: defaultNameFormData,
    //     verificationChecks: {},
    //   });

    //   expect(isDocFirstFlow).toBe(false);
    // });

    it('should process case where doc flow is not first correctly', () => {
      const { isDocFirstFlow } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYC,
          personal: {
            ...defaultPlaybookValuesKYC.personal,
            docs: {
              ...defaultPlaybookValuesKYC.personal.docs,
              global: [SupportedIdDocTypes.passport, SupportedIdDocTypes.driversLicense],
              selfie: true,
              idDocFirst: false,
            },
          },
        },
        kind: PlaybookKind.Kyc,
        nameForm: defaultNameFormData,
        verificationChecks: {},
      });

      expect(isDocFirstFlow).toBe(false);
    });

    it('in default case, should not be phone first flow flow', () => {
      const { isNoPhoneFlow, mustCollectData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYC,
          personal: {
            ...defaultPlaybookValuesKYC.personal,
          },
        },
        kind: PlaybookKind.Kyc,
        nameForm: defaultNameFormData,
        verificationChecks: {},
      });

      expect(isNoPhoneFlow).toBe(false);
      expect(mustCollectData).toContain(CollectedKycDataOption.phoneNumber);
    });

    it('should register as no phone flow if phone is toggled off', () => {
      const { isNoPhoneFlow, mustCollectData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYC,
          personal: {
            ...defaultPlaybookValuesKYC.personal,
            [CollectedKycDataOption.phoneNumber]: false,
          },
        },
        kind: PlaybookKind.Kyc,
        nameForm: defaultNameFormData,
        verificationChecks: {},
      });
      expect(isNoPhoneFlow).toBe(true);
      expect(mustCollectData).not.toContain(CollectedKycDataOption.phoneNumber);
    });

    it('should include phone number and not submit isNoPhoneFlow for default case', () => {
      const { isNoPhoneFlow, mustCollectData } = processPlaybook({
        playbook: defaultPlaybookValuesKYC,
        kind: PlaybookKind.Kyc,
        nameForm: defaultNameFormData,
        verificationChecks: {},
      });
      expect(isNoPhoneFlow).toBe(false);
      expect(mustCollectData).toContain(CollectedKycDataOption.phoneNumber);
    });

    it('should not register as no phone flow if phone is toggled on', () => {
      const { isNoPhoneFlow, mustCollectData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYC,
          personal: {
            ...defaultPlaybookValuesKYC.personal,
            [CollectedKycDataOption.phoneNumber]: true,
          },
        },
        kind: PlaybookKind.Kyc,
        nameForm: defaultNameFormData,
        verificationChecks: {},
      });
      expect(isNoPhoneFlow).toBe(false);
      expect(mustCollectData).toContain(CollectedKycDataOption.phoneNumber);
    });

    it('should correctly extract name', () => {
      const { name } = processPlaybook({
        playbook: defaultPlaybookValuesKYC,
        kind: PlaybookKind.Kyc,
        nameForm: { kind: PlaybookKind.Kyc, name: 'test name' },
        verificationChecks: {},
      });
      expect(name).toBe('test name');
    });

    describe('residency', () => {
      describe('when only "US residents" is selected', () => {
        it('should generate the payload correctly', () => {
          const {
            allowUsResidents,
            allowUsTerritories,
            allowInternationalResidents,
            internationalCountryRestrictions,
          } = processPlaybook({
            playbook: defaultPlaybookValuesKYC,
            kind: PlaybookKind.Kyc,
            nameForm: { kind: PlaybookKind.Kyc, name: 'test name' },
            residencyForm: {
              allowUsResidents: true,
              allowUsTerritories: false,
              allowInternationalResidents: false,
            },
            verificationChecks: {},
          });

          expect(allowUsResidents).toBeTruthy();
          expect(allowUsTerritories).toBeFalsy();
          expect(allowInternationalResidents).toBeFalsy();
          expect(internationalCountryRestrictions).toBeNull();
        });
      });

      describe('when "US residents" and "US territories" is selected', () => {
        it('should generate the payload correctly', () => {
          const {
            allowUsResidents,
            allowUsTerritories,
            allowInternationalResidents,
            internationalCountryRestrictions,
          } = processPlaybook({
            playbook: defaultPlaybookValuesKYC,
            kind: PlaybookKind.Kyc,
            nameForm: { kind: PlaybookKind.Kyc, name: 'test name' },
            residencyForm: {
              allowUsResidents: true,
              allowUsTerritories: true,
              allowInternationalResidents: false,
            },
            verificationChecks: {},
          });

          expect(allowUsResidents).toBeTruthy();
          expect(allowUsTerritories).toBeTruthy();
          expect(allowInternationalResidents).toBeFalsy();
          expect(internationalCountryRestrictions).toBeNull();
        });
      });

      describe('when "US residents" and "International" are selected', () => {
        it('should generate the payload correctly', () => {
          const {
            allowUsResidents,
            allowUsTerritories,
            allowInternationalResidents,
            internationalCountryRestrictions,
          } = processPlaybook({
            playbook: defaultPlaybookValuesKYC,
            kind: PlaybookKind.Kyc,
            nameForm: { kind: PlaybookKind.Kyc, name: 'test name' },
            residencyForm: {
              allowUsResidents: true,
              allowUsTerritories: false,
              allowInternationalResidents: true,
              restrictCountries: CountryRestriction.all,
            },
            verificationChecks: {},
          });

          expect(allowUsResidents).toBeTruthy();
          expect(allowUsTerritories).toBeFalsy();
          expect(allowInternationalResidents).toBeTruthy();
          expect(internationalCountryRestrictions).toBeNull();
        });
      });

      describe('when "US Residents", "International" and "Restrict onboarding to specific countries" is selected', () => {
        it('should generate the payload correctly', () => {
          const chile = COUNTRIES.find(country => country.label === 'Chile') as CountryRecord;

          const {
            allowUsResidents,
            allowUsTerritories,
            allowInternationalResidents,
            internationalCountryRestrictions,
          } = processPlaybook({
            playbook: defaultPlaybookValuesKYC,
            kind: PlaybookKind.Kyc,
            nameForm: { kind: PlaybookKind.Kyc, name: 'test name' },
            residencyForm: {
              allowUsResidents: true,
              allowUsTerritories: false,
              allowInternationalResidents: true,
              restrictCountries: CountryRestriction.restrict,
              countryList: [chile],
            },
            verificationChecks: {},
          });

          expect(allowUsResidents).toBeTruthy();
          expect(allowUsTerritories).toBeFalsy();
          expect(allowInternationalResidents).toBe(true);
          expect(internationalCountryRestrictions).toEqual(['CL']);
        });
      });

      describe('when "US Residents" is unselected and "International" and is selected', () => {
        it('should process restricted US-inclusive international config properly', () => {
          const chile = COUNTRIES.find(country => country.label === 'Chile') as CountryRecord;

          const {
            allowUsResidents,
            allowUsTerritories,
            allowInternationalResidents,
            internationalCountryRestrictions,
          } = processPlaybook({
            playbook: defaultPlaybookValuesKYC,
            kind: PlaybookKind.Kyc,
            nameForm: { kind: PlaybookKind.Kyc, name: 'test name' },
            residencyForm: {
              allowUsResidents: false,
              allowUsTerritories: false,
              allowInternationalResidents: true,
              restrictCountries: CountryRestriction.restrict,
              countryList: [chile],
            },
            verificationChecks: {},
          });

          expect(allowUsResidents).toBeFalsy();
          expect(allowUsTerritories).toBeFalsy();
          expect(allowInternationalResidents).toBeTruthy();
          expect(internationalCountryRestrictions).toEqual(['CL']);
        });
      });

      describe('when "All countries" and "Allow residentes from US" are selected', () => {
        it('should set allowUsTerritories to false', () => {
          const {
            allowUsResidents,
            allowUsTerritories,
            allowInternationalResidents,
            internationalCountryRestrictions,
          } = processPlaybook({
            playbook: defaultPlaybookValuesKYC,
            kind: PlaybookKind.Kyc,
            nameForm: { kind: PlaybookKind.Kyc, name: 'test name' },
            residencyForm: {
              allowUsResidents: true,
              allowUsTerritories: false,
              allowInternationalResidents: true,
              restrictCountries: CountryRestriction.all,
            },
            verificationChecks: {},
          });

          expect(allowUsResidents).toBeTruthy();
          expect(allowUsTerritories).toBeFalsy();
          expect(allowInternationalResidents).toBeTruthy();
          expect(internationalCountryRestrictions).toBeNull();
        });
      });
    });

    describe('additional docs', () => {
      describe('when "Proof of Address" is selected', () => {
        it('should generate the payload correctly', () => {
          const { documentsToCollect } = processPlaybook({
            playbook: {
              ...defaultPlaybookValuesKYC,
              personal: {
                ...defaultPlaybookValuesKYC.personal,
                additionalDocs: {
                  poa: true,
                  possn: false,
                },
              },
            },
            kind: PlaybookKind.Kyc,
            nameForm: { kind: PlaybookKind.Kyc, name: 'test name' },
            verificationChecks: {},
          });

          expect(documentsToCollect).toEqual([{ data: {}, kind: 'proof_of_address' }]);
        });
      });

      describe('when "Proof of SSN" is selected', () => {
        it('should generate the payload correctly', () => {
          const { documentsToCollect } = processPlaybook({
            playbook: {
              ...defaultPlaybookValuesKYC,
              personal: {
                ...defaultPlaybookValuesKYC.personal,
                additionalDocs: {
                  poa: false,
                  possn: true,
                },
              },
            },
            kind: PlaybookKind.Kyc,
            nameForm: { kind: PlaybookKind.Kyc, name: 'test name' },
            verificationChecks: {},
          });

          expect(documentsToCollect).toEqual([{ data: {}, kind: 'proof_of_ssn' }]);
        });
      });
    });
  });

  describe('KYB', () => {
    it('should return required KYB fields in mustCollectData regardless of playbook values', () => {
      const { mustCollectData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYB,
          businessInformation: {
            ...defaultBusinessInformation,
            [CollectedKybDataOption.name]: false,
            [CollectedKybDataOption.tin]: false,
          },
        },
        kind: PlaybookKind.Kyb,
        nameForm: defaultNameFormData,
        verificationChecks: {
          kyb: {
            skip: false,
            kind: 'full',
          },
        },
      });

      expect(mustCollectData).toContain(CollectedKybDataOption.name);
      expect(mustCollectData).toContain(CollectedKybDataOption.tin);
    });

    it('should not include any KYC fields in mustCollectData if KYB beneficial owners is not collected', () => {
      const { mustCollectData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYB,
          businessInformation: {
            ...defaultBusinessInformation,
            [CollectedKybDataOption.beneficialOwners]: false,
          },
        },
        kind: PlaybookKind.Kyb,
        nameForm: defaultNameFormData,
        verificationChecks: {
          kyb: {
            skip: false,
            kind: 'full',
          },
        },
      });

      expect(mustCollectData).not.toContain(CollectedKycDataOption.email);
      expect(mustCollectData).not.toContain(CollectedKycDataOption.phoneNumber);
      expect(mustCollectData).not.toContain(CollectedKycDataOption.name);
      expect(mustCollectData).not.toContain(CollectedKycDataOption.dob);
      expect(mustCollectData).not.toContain(CollectedKycDataOption.address);
    });

    it('should include corporation type if required', () => {
      const { mustCollectData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYB,
          businessInformation: {
            ...defaultBusinessInformation,
            [CollectedKybDataOption.corporationType]: true,
          },
        },
        kind: PlaybookKind.Kyb,
        nameForm: defaultNameFormData,
        verificationChecks: {
          kyb: {
            skip: false,
            kind: 'full',
          },
        },
      });

      expect(mustCollectData).toContain(CollectedKybDataOption.corporationType);
    });

    it('should not include corporation type if not required', () => {
      const { mustCollectData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYB,
          businessInformation: {
            ...defaultBusinessInformation,
            [CollectedKybDataOption.corporationType]: false,
          },
        },
        kind: PlaybookKind.Kyb,
        nameForm: defaultNameFormData,
        verificationChecks: {
          kyb: {
            skip: false,
            kind: 'full',
          },
        },
      });

      expect(mustCollectData).not.toContain(CollectedKybDataOption.corporationType);
    });

    it('should include website type if required', () => {
      const { mustCollectData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYB,
          businessInformation: {
            ...defaultBusinessInformation,
            [CollectedKybDataOption.website]: true,
          },
        },
        kind: PlaybookKind.Kyb,
        nameForm: defaultNameFormData,
        verificationChecks: {
          kyb: {
            skip: false,
            kind: 'full',
          },
        },
      });

      expect(mustCollectData).toContain(CollectedKybDataOption.website);
    });

    it('should not include website type if not required', () => {
      const { mustCollectData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYB,
          businessInformation: {
            ...defaultBusinessInformation,
            [CollectedKybDataOption.website]: false,
          },
        },
        kind: PlaybookKind.Kyb,
        nameForm: defaultNameFormData,
        verificationChecks: {
          kyb: {
            skip: false,
            kind: 'full',
          },
        },
      });

      expect(mustCollectData).not.toContain(CollectedKybDataOption.website);
    });

    it('should include phone number if required', () => {
      const { mustCollectData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYB,
          businessInformation: {
            ...defaultBusinessInformation,
            [CollectedKybDataOption.phoneNumber]: true,
          },
        },
        kind: PlaybookKind.Kyb,
        nameForm: defaultNameFormData,
        verificationChecks: {
          kyb: {
            skip: false,
            kind: 'full',
          },
        },
      });

      expect(mustCollectData).toContain(CollectedKybDataOption.phoneNumber);
    });

    it('should not include phone number if not required', () => {
      const { mustCollectData } = processPlaybook({
        playbook: {
          ...defaultPlaybookValuesKYB,
          businessInformation: {
            ...defaultBusinessInformation,
            [CollectedKybDataOption.website]: false,
          },
        },
        kind: PlaybookKind.Kyb,
        nameForm: defaultNameFormData,
        verificationChecks: {
          kyb: {
            skip: false,
            kind: 'full',
          },
        },
      });

      expect(mustCollectData).not.toContain(CollectedKybDataOption.phoneNumber);
    });

    describe('verification checks', () => {
      describe('when the user selects to do a full KYB verification', () => {
        it('should return einOnly == false in the verification checks object', () => {
          const { verificationChecks } = processPlaybook({
            playbook: {
              ...defaultPlaybookValuesKYB,
              businessInformation: {
                ...defaultBusinessInformation,
                [CollectedKybDataOption.name]: false,
                [CollectedKybDataOption.address]: false,
                [CollectedKybDataOption.tin]: false,
              },
            },
            kind: PlaybookKind.Kyb,
            nameForm: defaultNameFormData,
            verificationChecks: {
              kyb: {
                skip: false,
                kind: 'full',
              },
            },
          });

          const isFull = verificationChecks?.find(({ kind, data }) => kind === 'kyb' && data && data.einOnly === false);
          expect(isFull).toBeTruthy();
        });
      });

      describe('when the user selects to verify ein only', () => {
        it('should return einOnly == true in the verification checks object', () => {
          const { verificationChecks } = processPlaybook({
            playbook: {
              ...defaultPlaybookValuesKYB,
              businessInformation: {
                ...defaultBusinessInformation,
                [CollectedKybDataOption.name]: false,
                [CollectedKybDataOption.address]: false,
                [CollectedKybDataOption.tin]: false,
              },
            },
            kind: PlaybookKind.Kyb,
            nameForm: defaultNameFormData,
            verificationChecks: {
              kyb: {
                skip: false,
                kind: 'ein',
              },
            },
          });

          const isEin = verificationChecks?.find(({ kind, data }) => kind === 'kyb' && data?.einOnly);

          expect(isEin).toBeTruthy();
        });
      });
    });
  });
});

describe('getMandatoryAndOptionalTaxIdFields', () => {
  it('should return [undefined, undefined] when ssn is false', () => {
    expect(
      getMandatoryAndOptionalTaxIdFields({
        ssn: false,
        ssnKind: 'ssn9',
        ssnOptional: false,
        usTaxIdAcceptable: false,
      } as Personal),
    ).toEqual([undefined, undefined]);
  });

  it('should return [undefined, ssn9] when ssn9 is optional', () => {
    expect(
      getMandatoryAndOptionalTaxIdFields({
        ssn: false,
        ssnKind: 'ssn9',
        ssnOptional: true,
        usTaxIdAcceptable: false,
      } as Personal),
    ).toEqual([undefined, 'ssn9']);
  });

  it('should return [undefined, undefined] when all is falsy', () => {
    expect(
      getMandatoryAndOptionalTaxIdFields({
        ssn: false,
        ssnKind: undefined,
        ssnOptional: false,
        usTaxIdAcceptable: false,
      } as Personal),
    ).toEqual([undefined, undefined]);
  });

  it('should return [ssn4, undefined] when ssn4 is mandatory', () => {
    expect(
      getMandatoryAndOptionalTaxIdFields({
        ssn: true,
        ssnKind: 'ssn4',
        ssnOptional: false,
        usTaxIdAcceptable: false,
      } as Personal),
    ).toEqual(['ssn4', undefined]);
  });

  it('should return [ssn4, undefined] when ssn4 is mandatory and itin is checked', () => {
    expect(
      getMandatoryAndOptionalTaxIdFields({
        ssn: true,
        ssnKind: 'ssn4',
        ssnOptional: false,
        usTaxIdAcceptable: true,
      } as Personal),
    ).toEqual(['ssn4', undefined]);
  });

  it('should return [undefined, ssn4] when ssn4 is optional', () => {
    expect(
      getMandatoryAndOptionalTaxIdFields({
        ssn: true,
        ssnKind: 'ssn4',
        ssnOptional: true,
        usTaxIdAcceptable: false,
      } as Personal),
    ).toEqual([undefined, 'ssn4']);
  });

  it('should return [undefined, ssn4] when ssn4 is optional and itin is checked', () => {
    expect(
      getMandatoryAndOptionalTaxIdFields({
        ssn: true,
        ssnKind: 'ssn4',
        ssnOptional: true,
        usTaxIdAcceptable: true,
      } as Personal),
    ).toEqual([undefined, 'ssn4']);
  });

  it('should return [ssn9, undefined] when ssn9 is mandatory', () => {
    expect(
      getMandatoryAndOptionalTaxIdFields({
        ssn: true,
        ssnKind: 'ssn9',
        ssnOptional: false,
        usTaxIdAcceptable: false,
      } as Personal),
    ).toEqual(['ssn9', undefined]);
  });

  it('should return [us_tax_id, undefined] when ssn9 is mandatory and itin is checked ', () => {
    expect(
      getMandatoryAndOptionalTaxIdFields({
        ssn: true,
        ssnKind: 'ssn9',
        ssnOptional: false,
        usTaxIdAcceptable: true,
      } as Personal),
    ).toEqual(['us_tax_id', undefined]);
  });

  it('should return [undefined, ssn9] when ssn9 is optional and itin is not checked', () => {
    expect(
      getMandatoryAndOptionalTaxIdFields({
        ssn: true,
        ssnKind: 'ssn9',
        ssnOptional: true,
        usTaxIdAcceptable: false,
      } as Personal),
    ).toEqual([undefined, 'ssn9']);
  });

  it('should return [undefined, undefined] when ssn is true and the values are falsy', () => {
    expect(
      getMandatoryAndOptionalTaxIdFields({
        ssn: true,
        ssnKind: undefined,
        ssnOptional: true,
        usTaxIdAcceptable: false,
      } as Personal),
    ).toEqual([undefined, undefined]);
  });
});
