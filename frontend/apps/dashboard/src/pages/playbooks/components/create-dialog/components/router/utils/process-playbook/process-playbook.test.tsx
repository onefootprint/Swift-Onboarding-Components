import type { CountryRecord } from '@onefootprint/global-constants';
import { COUNTRIES } from '@onefootprint/global-constants';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import {
  CountryRestriction,
  defaultAuthorizedScopesValues,
  defaultBusinessInformation,
  defaultNameFormData,
  defaultPlaybookValuesKYB,
  defaultPlaybookValuesKYC,
  PlaybookKind,
} from 'src/pages/playbooks/utils/machine/types';

import processPlaybook from './process-playbook';

describe('processPlaybook', () => {
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
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });

    expect(mustCollectData).toContain(CollectedKycDataOption.email);
    expect(mustCollectData).toContain(CollectedKycDataOption.name);
    expect(mustCollectData).toContain(CollectedKycDataOption.dob);
    expect(mustCollectData).toContain(CollectedKycDataOption.address);
  });

  it('should return required KYB fields in mustCollectData regardless of playbook values', () => {
    const { mustCollectData } = processPlaybook({
      playbook: {
        ...defaultPlaybookValuesKYB,
        businessInformation: {
          ...defaultBusinessInformation,
          [CollectedKybDataOption.name]: false,
          [CollectedKybDataOption.address]: false,
          [CollectedKybDataOption.tin]: false,
          [CollectedKybDataOption.beneficialOwners]: false,
        },
      },
      kind: PlaybookKind.Kyb,
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });

    expect(mustCollectData).toContain(CollectedKybDataOption.name);
    expect(mustCollectData).toContain(CollectedKybDataOption.address);
    expect(mustCollectData).toContain(CollectedKybDataOption.tin);
    expect(mustCollectData).toContain(CollectedKybDataOption.beneficialOwners);
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
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });

    expect(mustCollectData).not.toContain(CollectedKycDataOption.ssn9);
    expect(mustCollectData).not.toContain(CollectedKycDataOption.ssn4);
    expect(optionalData).toContain(CollectedKycDataOption.ssn9);
    expect(optionalData).not.toContain(CollectedKycDataOption.ssn4);
    expect(canAccessData).toContain(CollectedKycDataOption.ssn9);
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
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });

    expect(mustCollectData).not.toContain(CollectedKycDataOption.ssn4);
    expect(mustCollectData).not.toContain(CollectedKycDataOption.ssn9);
    expect(optionalData).toContain(CollectedKycDataOption.ssn4);
    expect(optionalData).not.toContain(CollectedKycDataOption.ssn9);
    expect(canAccessData).toContain(CollectedKycDataOption.ssn4);
    expect(canAccessData).not.toContain(CollectedKycDataOption.ssn9);
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
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
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
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });

    expect(mustCollectData).toContain(CollectedKycDataOption.ssn4);
    expect(mustCollectData).not.toContain(CollectedKycDataOption.ssn9);
    expect(optionalData).not.toContain(CollectedKycDataOption.ssn4);
    expect(optionalData).not.toContain(CollectedKycDataOption.ssn9);
  });

  // tk - tests for ID doc and selfie which are still coming

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
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });

    expect(mustCollectData).toContain(
      CollectedInvestorProfileDataOption.investorProfile,
    );
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
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
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
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });

    expect(mustCollectData).not.toContain(
      CollectedKybDataOption.corporationType,
    );
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
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
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
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
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
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
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
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });

    expect(mustCollectData).not.toContain(CollectedKybDataOption.phoneNumber);
  });

  it('should handle authorized scopes as expected for default KYC values', () => {
    const { canAccessData } = processPlaybook({
      playbook: defaultPlaybookValuesKYC,
      kind: PlaybookKind.Kyc,
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });

    expect(canAccessData).toContain(CollectedKycDataOption.email);
    expect(canAccessData).toContain(CollectedKycDataOption.phoneNumber);
    expect(canAccessData).toContain(CollectedKycDataOption.name);
    expect(canAccessData).toContain(CollectedKycDataOption.dob);
    expect(canAccessData).toContain(CollectedKycDataOption.address);
    expect(canAccessData).not.toContain(CollectedKycDataOption.ssn4);
    expect(canAccessData).toContain(CollectedKycDataOption.ssn9);
    // tk document case
    expect(canAccessData).not.toContain(
      CollectedInvestorProfileDataOption.investorProfile,
    );
  });

  it('should handle authorized scopes as expected for non-default KYC values', () => {
    const { canAccessData } = processPlaybook({
      playbook: {
        ...defaultPlaybookValuesKYC,
        [CollectedInvestorProfileDataOption.investorProfile]: true,
      },
      kind: PlaybookKind.Kyc,
      authorizedScopes: {
        ...defaultAuthorizedScopesValues,
        [CollectedKycDataOption.email]: false,
        [CollectedKycDataOption.phoneNumber]: false,
        [CollectedKycDataOption.name]: false,
        [CollectedKycDataOption.dob]: false,
        [CollectedKycDataOption.ssn4]: false,
        [CollectedKycDataOption.ssn9]: true,
      },
      nameForm: defaultNameFormData,
    });

    expect(canAccessData).not.toContain(CollectedKycDataOption.email);
    expect(canAccessData).not.toContain(CollectedKycDataOption.phoneNumber);
    expect(canAccessData).not.toContain(CollectedKycDataOption.name);
    expect(canAccessData).not.toContain(CollectedKycDataOption.dob);
    expect(canAccessData).toContain(CollectedKycDataOption.address);
    expect(canAccessData).not.toContain(CollectedKycDataOption.ssn4);
    expect(canAccessData).toContain(CollectedKycDataOption.ssn9);
    // tk document case
    expect(canAccessData).toContain(
      CollectedInvestorProfileDataOption.investorProfile,
    );
  });

  it('should handle authorized scopes as expected for default KYB values', () => {
    const { canAccessData } = processPlaybook({
      playbook: defaultPlaybookValuesKYB,
      kind: PlaybookKind.Kyb,
      authorizedScopes: {
        ...defaultAuthorizedScopesValues,
        allBusinessData: true,
      },
      nameForm: defaultNameFormData,
    });

    expect(canAccessData).toContain(CollectedKybDataOption.beneficialOwners);
    expect(canAccessData).toContain(CollectedKybDataOption.name);
    expect(canAccessData).toContain(CollectedKybDataOption.address);
    expect(canAccessData).toContain(CollectedKybDataOption.tin);
    expect(canAccessData).not.toContain(CollectedKybDataOption.website);
    expect(canAccessData).not.toContain(CollectedKybDataOption.corporationType);
    expect(canAccessData).not.toContain(CollectedKybDataOption.phoneNumber);
  });

  it('should handle authorized scopes as expected when adding optional KYB values', () => {
    const { canAccessData } = processPlaybook({
      playbook: {
        ...defaultPlaybookValuesKYB,
        businessInformation: {
          ...defaultBusinessInformation,
          [CollectedKybDataOption.website]: true,
          [CollectedKybDataOption.corporationType]: true,
          [CollectedKybDataOption.phoneNumber]: true,
        },
      },
      kind: PlaybookKind.Kyb,
      authorizedScopes: {
        ...defaultAuthorizedScopesValues,
        allBusinessData: true,
      },
      nameForm: defaultNameFormData,
    });

    expect(canAccessData).toContain(CollectedKybDataOption.beneficialOwners);
    expect(canAccessData).toContain(CollectedKybDataOption.name);
    expect(canAccessData).toContain(CollectedKybDataOption.address);
    expect(canAccessData).toContain(CollectedKybDataOption.tin);
    expect(canAccessData).toContain(CollectedKybDataOption.website);
    expect(canAccessData).toContain(CollectedKybDataOption.corporationType);
    expect(canAccessData).toContain(CollectedKybDataOption.phoneNumber);
  });

  it('should handle authorized scopes as expected when not including access to business data', () => {
    const { canAccessData } = processPlaybook({
      playbook: {
        ...defaultPlaybookValuesKYB,
        businessInformation: {
          ...defaultBusinessInformation,
          [CollectedKybDataOption.website]: true,
          [CollectedKybDataOption.corporationType]: true,
          [CollectedKybDataOption.phoneNumber]: true,
        },
      },
      kind: PlaybookKind.Kyb,
      authorizedScopes: {
        ...defaultAuthorizedScopesValues,
        allBusinessData: false,
      },
      nameForm: defaultNameFormData,
    });

    expect(canAccessData).not.toContain(
      CollectedKybDataOption.beneficialOwners,
    );
    expect(canAccessData).not.toContain(CollectedKybDataOption.name);
    expect(canAccessData).not.toContain(CollectedKybDataOption.address);
    expect(canAccessData).not.toContain(CollectedKybDataOption.tin);
    expect(canAccessData).not.toContain(CollectedKybDataOption.website);
    expect(canAccessData).not.toContain(CollectedKybDataOption.corporationType);
    expect(canAccessData).not.toContain(CollectedKybDataOption.phoneNumber);
  });

  it('should handle authorized scopes as expected for ID doc without selfie', () => {
    const { canAccessData } = processPlaybook({
      playbook: {
        ...defaultPlaybookValuesKYC,
        personal: {
          ...defaultPlaybookValuesKYC.personal,
          idDoc: true,
          idDocKind: [SupportedIdDocTypes.passport],
          selfie: false,
        },
      },
      kind: PlaybookKind.Kyc,
      authorizedScopes: {
        ...defaultAuthorizedScopesValues,
        [CollectedDocumentDataOption.document]: true,
      },
      nameForm: defaultNameFormData,
    });

    expect(canAccessData).toContain('document.passport.none.none');
  });

  it('should handle authorized scopes as expected for ID docs with selfie', () => {
    const { canAccessData } = processPlaybook({
      playbook: {
        ...defaultPlaybookValuesKYC,
        personal: {
          ...defaultPlaybookValuesKYC.personal,
          idDoc: true,
          idDocKind: [
            SupportedIdDocTypes.passport,
            SupportedIdDocTypes.driversLicense,
          ],
          selfie: true,
        },
      },
      kind: PlaybookKind.Kyc,
      authorizedScopes: {
        ...defaultAuthorizedScopesValues,
        [CollectedDocumentDataOption.document]: true,
      },
      nameForm: defaultNameFormData,
    });

    expect(canAccessData).toContain(
      'document.passport,drivers_license.none.require_selfie',
    );
  });
  it('should handle single id doc type correctly without selfie', () => {
    const { mustCollectData } = processPlaybook({
      playbook: {
        ...defaultPlaybookValuesKYC,
        personal: {
          ...defaultPlaybookValuesKYC.personal,
          idDoc: true,
          idDocKind: [SupportedIdDocTypes.passport],
          selfie: false,
        },
      },
      kind: PlaybookKind.Kyc,
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });

    expect(mustCollectData).toContain('document.passport.none.none');
  });

  it('should handle multiple id doc types correctly without selfie', () => {
    const { mustCollectData } = processPlaybook({
      playbook: {
        ...defaultPlaybookValuesKYC,
        personal: {
          ...defaultPlaybookValuesKYC.personal,
          idDoc: true,
          idDocKind: [
            SupportedIdDocTypes.passport,
            SupportedIdDocTypes.driversLicense,
          ],
          selfie: false,
        },
      },
      kind: PlaybookKind.Kyc,
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });

    expect(mustCollectData).toContain(
      'document.passport,drivers_license.none.none',
    );
  });

  it('should handle single id doc type correctly with selfie', () => {
    const { mustCollectData } = processPlaybook({
      playbook: {
        ...defaultPlaybookValuesKYC,
        personal: {
          ...defaultPlaybookValuesKYC.personal,
          idDoc: true,
          idDocKind: [SupportedIdDocTypes.passport],
          selfie: true,
        },
      },
      kind: PlaybookKind.Kyc,
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });

    expect(mustCollectData).toContain('document.passport.none.require_selfie');
  });

  it('should handle multiple id doc types correctly with selfie', () => {
    const { mustCollectData } = processPlaybook({
      playbook: {
        ...defaultPlaybookValuesKYC,
        personal: {
          ...defaultPlaybookValuesKYC.personal,
          idDoc: true,
          idDocKind: [
            SupportedIdDocTypes.passport,
            SupportedIdDocTypes.driversLicense,
          ],
          selfie: true,
        },
      },
      kind: PlaybookKind.Kyc,
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });

    expect(mustCollectData).toContain(
      'document.passport,drivers_license.none.require_selfie',
    );
  });

  it('should process case where doc flow is first correctly', () => {
    const { isDocFirstFlow } = processPlaybook({
      playbook: {
        ...defaultPlaybookValuesKYC,
        personal: {
          ...defaultPlaybookValuesKYC.personal,
          idDoc: true,
          idDocKind: [
            SupportedIdDocTypes.passport,
            SupportedIdDocTypes.driversLicense,
          ],
          idDocFirst: true,
          selfie: true,
        },
      },
      kind: PlaybookKind.Kyc,
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });
    expect(isDocFirstFlow).toBe(true);
  });

  it('should process default case where doc flow is not specified correctly', () => {
    const { isDocFirstFlow } = processPlaybook({
      playbook: {
        ...defaultPlaybookValuesKYC,
        personal: {
          ...defaultPlaybookValuesKYC.personal,
          idDoc: true,
          idDocKind: [
            SupportedIdDocTypes.passport,
            SupportedIdDocTypes.driversLicense,
          ],
          selfie: true,
        },
      },
      kind: PlaybookKind.Kyc,
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });
    expect(isDocFirstFlow).toBe(false);
  });

  it('should process case where doc flow is not first correctly', () => {
    const { isDocFirstFlow } = processPlaybook({
      playbook: {
        ...defaultPlaybookValuesKYC,
        personal: {
          ...defaultPlaybookValuesKYC.personal,
          idDoc: true,
          idDocKind: [
            SupportedIdDocTypes.passport,
            SupportedIdDocTypes.driversLicense,
          ],
          selfie: true,
          idDocFirst: false,
        },
      },
      kind: PlaybookKind.Kyc,
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
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
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
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
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });
    expect(isNoPhoneFlow).toBe(true);
    expect(mustCollectData).not.toContain(CollectedKycDataOption.phoneNumber);
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
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });
    expect(isNoPhoneFlow).toBe(false);
    expect(mustCollectData).toContain(CollectedKycDataOption.phoneNumber);
  });

  it('should include phone number and not submit isNoPhoneFlow for default case', () => {
    const { isNoPhoneFlow, mustCollectData } = processPlaybook({
      playbook: defaultPlaybookValuesKYC,
      kind: PlaybookKind.Kyc,
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: defaultNameFormData,
    });
    expect(isNoPhoneFlow).toBe(false);
    expect(mustCollectData).toContain(CollectedKycDataOption.phoneNumber);
  });

  it('should correctly extract name', () => {
    const { name } = processPlaybook({
      playbook: defaultPlaybookValuesKYC,
      kind: PlaybookKind.Kyc,
      authorizedScopes: defaultAuthorizedScopesValues,
      nameForm: { kind: PlaybookKind.Kyc, name: 'test name' },
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
          authorizedScopes: defaultAuthorizedScopesValues,
          nameForm: { kind: PlaybookKind.Kyc, name: 'test name' },
          residencyForm: {
            allowUsResidents: true,
            allowUsTerritories: false,
            allowInternationalResidents: false,
          },
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
          authorizedScopes: defaultAuthorizedScopesValues,
          nameForm: { kind: PlaybookKind.Kyc, name: 'test name' },
          residencyForm: {
            allowUsResidents: true,
            allowUsTerritories: true,
            allowInternationalResidents: false,
          },
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
          authorizedScopes: defaultAuthorizedScopesValues,
          nameForm: { kind: PlaybookKind.Kyc, name: 'test name' },
          residencyForm: {
            allowUsResidents: true,
            allowUsTerritories: false,
            allowInternationalResidents: true,
            restrictCountries: CountryRestriction.all,
          },
        });
        expect(allowUsResidents).toBeTruthy();
        expect(allowUsTerritories).toBeFalsy();
        expect(allowInternationalResidents).toBeTruthy();
        expect(internationalCountryRestrictions).toBeNull();
      });
    });

    describe('when "US Residents", "International" and "Restrict onboarding to specific countries" is selected', () => {
      it('should generate the payload correctly', () => {
        const chile = COUNTRIES.find(
          country => country.label === 'Chile',
        ) as CountryRecord;

        const {
          allowUsResidents,
          allowUsTerritories,
          allowInternationalResidents,
          internationalCountryRestrictions,
        } = processPlaybook({
          playbook: defaultPlaybookValuesKYC,
          kind: PlaybookKind.Kyc,
          authorizedScopes: defaultAuthorizedScopesValues,
          nameForm: { kind: PlaybookKind.Kyc, name: 'test name' },
          residencyForm: {
            allowUsResidents: true,
            allowUsTerritories: false,
            allowInternationalResidents: true,
            restrictCountries: CountryRestriction.restrict,
            countryList: [chile],
          },
        });

        expect(allowUsResidents).toBeTruthy();
        expect(allowUsTerritories).toBeFalsy();
        expect(allowInternationalResidents).toBe(true);
        expect(internationalCountryRestrictions).toEqual(['CL']);
      });
    });

    describe('when "US Residents" is unselected and "International" and is selected', () => {
      it('should process restricted US-inclusive international config properly', () => {
        const chile = COUNTRIES.find(
          country => country.label === 'Chile',
        ) as CountryRecord;

        const {
          allowUsResidents,
          allowUsTerritories,
          allowInternationalResidents,
          internationalCountryRestrictions,
        } = processPlaybook({
          playbook: defaultPlaybookValuesKYC,
          kind: PlaybookKind.Kyc,
          authorizedScopes: defaultAuthorizedScopesValues,
          nameForm: { kind: PlaybookKind.Kyc, name: 'test name' },
          residencyForm: {
            allowUsResidents: false,
            allowUsTerritories: false,
            allowInternationalResidents: true,
            restrictCountries: CountryRestriction.restrict,
            countryList: [chile],
          },
        });

        expect(allowUsResidents).toBeFalsy();
        expect(allowUsTerritories).toBeFalsy();
        expect(allowInternationalResidents).toBeTruthy();
        expect(internationalCountryRestrictions).toEqual(['CL']);
      });
    });
  });
});
