import {
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import {
  defaultAuthorizedScopesValues,
  defaultBusinessInformation,
  defaultPlaybookValuesKYB,
  defaultPlaybookValuesKYC,
  Kind,
} from 'src/pages/playbooks/utils/machine/types';

import processPlaybook from './process-playbook';

describe('processPlaybook', () => {
  it('should return required KYC fields in mustCollectData regardless of playbook values', () => {
    const { mustCollectData } = processPlaybook({
      playbook: {
        ...defaultPlaybookValuesKYC,
        personalInformationAndDocs: {
          ...defaultPlaybookValuesKYC.personalInformationAndDocs,
          [CollectedKycDataOption.email]: false,
          [CollectedKycDataOption.phoneNumber]: false,
          [CollectedKycDataOption.dob]: false,
          [CollectedKycDataOption.fullAddress]: false,
        },
      },
      kind: Kind.KYC,
      authorizedScopes: defaultAuthorizedScopesValues,
    });

    expect(mustCollectData).toContain(CollectedKycDataOption.email);
    expect(mustCollectData).toContain(CollectedKycDataOption.phoneNumber);
    expect(mustCollectData).toContain(CollectedKycDataOption.name);
    expect(mustCollectData).toContain(CollectedKycDataOption.dob);
    expect(mustCollectData).toContain(CollectedKycDataOption.fullAddress);
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
      kind: Kind.KYB,
      authorizedScopes: defaultAuthorizedScopesValues,
    });

    expect(mustCollectData).toContain(CollectedKybDataOption.name);
    expect(mustCollectData).toContain(CollectedKybDataOption.address);
    expect(mustCollectData).toContain(CollectedKybDataOption.tin);
    expect(mustCollectData).toContain(CollectedKybDataOption.beneficialOwners);
  });

  it('should include full SSN in optional data but not mustCollectData if it is optional', () => {
    const { mustCollectData, optionalData } = processPlaybook({
      playbook: {
        ...defaultPlaybookValuesKYC,
        personalInformationAndDocs: {
          ...defaultPlaybookValuesKYC.personalInformationAndDocs,
          ssn: true,
          ssnOptional: true,
          ssnKind: CollectedKycDataOption.ssn9,
        },
      },
      kind: Kind.KYC,
      authorizedScopes: defaultAuthorizedScopesValues,
    });

    expect(mustCollectData).not.toContain(CollectedKycDataOption.ssn9);
    expect(mustCollectData).not.toContain(CollectedKycDataOption.ssn4);
    expect(optionalData).toContain(CollectedKycDataOption.ssn9);
    expect(optionalData).not.toContain(CollectedKycDataOption.ssn4);
  });

  it('should include SSN last 4 in optional data but not mustCollectData if it is optional', () => {
    const { mustCollectData, optionalData } = processPlaybook({
      playbook: {
        ...defaultPlaybookValuesKYC,
        personalInformationAndDocs: {
          ...defaultPlaybookValuesKYC.personalInformationAndDocs,
          ssn: true,
          ssnOptional: true,
          ssnKind: CollectedKycDataOption.ssn4,
        },
      },
      kind: Kind.KYC,
      authorizedScopes: defaultAuthorizedScopesValues,
    });

    expect(mustCollectData).not.toContain(CollectedKycDataOption.ssn4);
    expect(mustCollectData).not.toContain(CollectedKycDataOption.ssn9);
    expect(optionalData).toContain(CollectedKycDataOption.ssn4);
    expect(optionalData).not.toContain(CollectedKycDataOption.ssn9);
  });

  it('should include full SSN in mustCollectData if required', () => {
    const { mustCollectData, optionalData } = processPlaybook({
      playbook: {
        ...defaultPlaybookValuesKYC,
        personalInformationAndDocs: {
          ...defaultPlaybookValuesKYC.personalInformationAndDocs,
          ssn: true,
          ssnKind: CollectedKycDataOption.ssn9,
        },
      },
      kind: Kind.KYC,
      authorizedScopes: defaultAuthorizedScopesValues,
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
        personalInformationAndDocs: {
          ...defaultPlaybookValuesKYC.personalInformationAndDocs,
          ssn: true,
          ssnKind: CollectedKycDataOption.ssn4,
        },
      },
      kind: Kind.KYC,
      authorizedScopes: defaultAuthorizedScopesValues,
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
        personalInformationAndDocs: {
          ...defaultPlaybookValuesKYC.personalInformationAndDocs,
        },
        [CollectedInvestorProfileDataOption.investorProfile]: true,
      },
      kind: Kind.KYC,
      authorizedScopes: defaultAuthorizedScopesValues,
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
      kind: Kind.KYB,
      authorizedScopes: defaultAuthorizedScopesValues,
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
      kind: Kind.KYB,
      authorizedScopes: defaultAuthorizedScopesValues,
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
      kind: Kind.KYB,
      authorizedScopes: defaultAuthorizedScopesValues,
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
      kind: Kind.KYB,
      authorizedScopes: defaultAuthorizedScopesValues,
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
      kind: Kind.KYB,
      authorizedScopes: defaultAuthorizedScopesValues,
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
      kind: Kind.KYB,
      authorizedScopes: defaultAuthorizedScopesValues,
    });

    expect(mustCollectData).not.toContain(CollectedKybDataOption.phoneNumber);
  });

  it('should handle authorized scopes as expected for default KYC values', () => {
    const { canAccessData } = processPlaybook({
      playbook: defaultPlaybookValuesKYC,
      kind: Kind.KYC,
      authorizedScopes: defaultAuthorizedScopesValues,
    });

    expect(canAccessData).toContain(CollectedKycDataOption.email);
    expect(canAccessData).toContain(CollectedKycDataOption.phoneNumber);
    expect(canAccessData).toContain(CollectedKycDataOption.name);
    expect(canAccessData).toContain(CollectedKycDataOption.dob);
    expect(canAccessData).toContain(CollectedKycDataOption.fullAddress);
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
      kind: Kind.KYC,
      authorizedScopes: {
        ...defaultAuthorizedScopesValues,
        [CollectedKycDataOption.email]: false,
        [CollectedKycDataOption.phoneNumber]: false,
        [CollectedKycDataOption.name]: false,
        [CollectedKycDataOption.dob]: false,
        [CollectedKycDataOption.ssn4]: false,
        [CollectedKycDataOption.ssn9]: true,
      },
    });

    expect(canAccessData).not.toContain(CollectedKycDataOption.email);
    expect(canAccessData).not.toContain(CollectedKycDataOption.phoneNumber);
    expect(canAccessData).not.toContain(CollectedKycDataOption.name);
    expect(canAccessData).not.toContain(CollectedKycDataOption.dob);
    expect(canAccessData).toContain(CollectedKycDataOption.fullAddress);
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
      kind: Kind.KYB,
      authorizedScopes: {
        ...defaultAuthorizedScopesValues,
        allBusinessData: true,
      },
    });

    expect(canAccessData).toContain(CollectedKybDataOption.beneficialOwners);
    expect(canAccessData).toContain('doingBusinessAs');
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
      kind: Kind.KYB,
      authorizedScopes: {
        ...defaultAuthorizedScopesValues,
        allBusinessData: true,
      },
    });

    expect(canAccessData).toContain(CollectedKybDataOption.beneficialOwners);
    expect(canAccessData).toContain('doingBusinessAs');
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
      kind: Kind.KYB,
      authorizedScopes: {
        ...defaultAuthorizedScopesValues,
        allBusinessData: false,
      },
    });

    expect(canAccessData).not.toContain(
      CollectedKybDataOption.beneficialOwners,
    );
    expect(canAccessData).not.toContain('doingBusinessAs');
    expect(canAccessData).not.toContain(CollectedKybDataOption.name);
    expect(canAccessData).not.toContain(CollectedKybDataOption.address);
    expect(canAccessData).not.toContain(CollectedKybDataOption.tin);
    expect(canAccessData).not.toContain(CollectedKybDataOption.website);
    expect(canAccessData).not.toContain(CollectedKybDataOption.corporationType);
    expect(canAccessData).not.toContain(CollectedKybDataOption.phoneNumber);
  });
});
