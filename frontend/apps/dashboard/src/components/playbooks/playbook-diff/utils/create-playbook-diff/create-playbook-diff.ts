import type { AuthMethodKind, OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import isEqual from 'lodash/isEqual';

export type Changes = { label: string; changes: Array<Diff> };

export type Diff = { alias: string; old: string; updated: string };

const getResidencyChanges = (old: OnboardingConfiguration, updated: OnboardingConfiguration) => {
  const residencyChanges: Array<Diff> = [];

  // US to International
  if (old.allowUsResidents && updated.allowInternationalResidents) {
    const updatedText = updated.internationalCountryRestrictions?.length
      ? `International residents (${updated.internationalCountryRestrictions.join(', ')})`
      : 'International residents (all countries)';

    residencyChanges.push({
      alias: 'residency-us-to-international',
      old: old.allowUsTerritoryResidents ? 'US and US territory residents' : 'US residents',
      updated: updatedText,
    });
  }

  // International to US
  if (old.allowInternationalResidents && updated.allowUsResidents) {
    const oldText = old.internationalCountryRestrictions?.length
      ? `International residents (${old.internationalCountryRestrictions.join(', ')})`
      : 'International residents (all countries)';

    residencyChanges.push({
      alias: 'residency-international-to-us',
      old: oldText,
      updated: updated.allowUsTerritoryResidents ? 'US and US territory residents' : 'US residents',
    });
  }

  // US Territory changes
  if (old.allowUsResidents && updated.allowUsResidents) {
    if (!old.allowUsTerritoryResidents && updated.allowUsTerritoryResidents) {
      residencyChanges.push({
        alias: 'residency-add-us-territory',
        old: 'US residents',
        updated: 'US and US territory residents',
      });
    } else if (old.allowUsTerritoryResidents && !updated.allowUsTerritoryResidents) {
      residencyChanges.push({
        alias: 'residency-remove-us-territory',
        old: 'US and US territory residents',
        updated: 'US residents',
      });
    }
  }

  // International country restrictions changes
  if (old.allowInternationalResidents && updated.allowInternationalResidents) {
    const oldCountries = old.internationalCountryRestrictions || [];
    const updatedCountries = updated.internationalCountryRestrictions || [];

    if (oldCountries.length === 0 && updatedCountries.length > 0) {
      residencyChanges.push({
        alias: 'residency-add-country-restrictions',
        old: 'International residents (all countries)',
        updated: `International residents (${updatedCountries.join(', ')})`,
      });
    } else if (oldCountries.length > 0 && updatedCountries.length === 0) {
      residencyChanges.push({
        alias: 'residency-remove-country-restrictions',
        old: `International residents (${oldCountries.join(', ')})`,
        updated: 'International residents (all countries)',
      });
    } else if (
      oldCountries.length > 0 &&
      updatedCountries.length > 0 &&
      oldCountries.join(',') !== updatedCountries.join(',')
    ) {
      residencyChanges.push({
        alias: 'residency-update-country-restrictions',
        old: `International residents (${oldCountries.join(', ')})`,
        updated: `International residents (${updatedCountries.join(', ')})`,
      });
    }
  }

  return residencyChanges;
};

const getBasicInfoChanges = (old: OnboardingConfiguration, updated: OnboardingConfiguration) => () => {
  const basicInfo: Array<Diff> = [];

  const getSsnChanges = (old: OnboardingConfiguration, updated: OnboardingConfiguration): Array<Diff> => {
    const ssnChanges: Array<Diff> = [];

    // SSN changed
    if (old.mustCollectData.includes('ssn9') && updated.mustCollectData.includes('ssn4')) {
      ssnChanges.push({ alias: 'ssn-change-9-to-4', old: 'SSN (Full)', updated: 'SSN (Last 4) ' });
    } else if (old.mustCollectData.includes('ssn4') && updated.mustCollectData.includes('ssn9')) {
      ssnChanges.push({ alias: 'ssn-change-4-to-9', old: 'SSN (Last 4)', updated: 'SSN (Full)' });
    }

    // SSN Required > Optional
    if (old.mustCollectData.includes('ssn9') && updated.optionalData.includes('ssn9')) {
      ssnChanges.push({
        alias: 'ssn-9-required-to-optional',
        old: 'SSN (Full) required',
        updated: 'SSN (Full) optional',
      });
    } else if (old.mustCollectData.includes('ssn9') && updated.optionalData.includes('ssn4')) {
      ssnChanges.push({
        alias: 'ssn-9-required-to-4-optional',
        old: 'SSN (Full) required',
        updated: 'SSN (Last 4) optional',
      });
    } else if (
      old.mustCollectData.includes('ssn4') &&
      (updated.optionalData.includes('ssn9') || updated.optionalData.includes('ssn4'))
    ) {
      ssnChanges.push({
        alias: 'ssn-4-required-to-optional',
        old: 'SSN (Last 4) required',
        updated: 'SSN (Last 4) optional',
      });
    }

    // SSN Required > Not collected
    if (
      old.mustCollectData.includes('ssn9') &&
      !updated.mustCollectData.includes('ssn9') &&
      !updated.optionalData.includes('ssn9') &&
      !updated.mustCollectData.includes('ssn4') &&
      !updated.optionalData.includes('ssn4')
    ) {
      ssnChanges.push({
        alias: 'ssn-9-required-to-not-collected',
        old: 'SSN (Full) required',
        updated: 'SSN (Full) is not collected',
      });
    } else if (
      old.mustCollectData.includes('ssn4') &&
      !updated.mustCollectData.includes('ssn4') &&
      !updated.optionalData.includes('ssn4') &&
      !updated.mustCollectData.includes('ssn9') &&
      !updated.optionalData.includes('ssn9')
    ) {
      ssnChanges.push({
        alias: 'ssn-4-required-to-not-collected',
        old: 'SSN (Last 4) required',
        updated: 'SSN (Last 4) is not collected',
      });
    }

    // US Tax ID changes
    if (old.mustCollectData.includes('us_tax_id') && !updated.mustCollectData.includes('us_tax_id')) {
      ssnChanges.push({
        alias: 'us-tax-id-required-to-not-collected',
        old: 'US Tax ID required',
        updated: 'US Tax ID is not collected',
      });
    } else if (!old.mustCollectData.includes('us_tax_id') && updated.mustCollectData.includes('us_tax_id')) {
      ssnChanges.push({
        alias: 'us-tax-id-not-collected-to-required',
        old: 'US Tax ID is not collected',
        updated: 'US Tax ID required',
      });
    }

    return ssnChanges;
  };

  const getLegalStatusChanges = (old: OnboardingConfiguration, updated: OnboardingConfiguration) => {
    const legalStatusChanges: Array<Diff> = [];

    // Legal status Required > Not required
    if (old.mustCollectData.includes('us_legal_status') && !updated.mustCollectData.includes('us_legal_status')) {
      legalStatusChanges.push({
        alias: 'legal-status-required-to-not-collected',
        old: 'US Legal Status required',
        updated: 'US Legal Status is not collected',
      });
    }

    // Legal status Not required > Required
    if (!old.mustCollectData.includes('us_legal_status') && updated.mustCollectData.includes('us_legal_status')) {
      legalStatusChanges.push({
        alias: 'legal-status-not-collected-to-required',
        old: 'US Legal Status is not collected',
        updated: 'US Legal Status required',
      });
    }

    return legalStatusChanges;
  };

  basicInfo.push(...getSsnChanges(old, updated));
  basicInfo.push(...getLegalStatusChanges(old, updated));
  return basicInfo;
};

const getBusinessChanges = (old: OnboardingConfiguration, updated: OnboardingConfiguration) => {
  const businessChanges: Array<Diff> = [];

  // Business name changes
  if (old.mustCollectData.includes('business_name') && !updated.mustCollectData.includes('business_name')) {
    businessChanges.push({
      alias: 'business-name-required-to-not-collected',
      old: 'Business name required',
      updated: 'Business name is not collected',
    });
  } else if (!old.mustCollectData.includes('business_name') && updated.mustCollectData.includes('business_name')) {
    businessChanges.push({
      alias: 'business-name-not-collected-to-required',
      old: 'Business name is not collected',
      updated: 'Business name required',
    });
  }

  // Business address changes
  if (old.mustCollectData.includes('business_address') && !updated.mustCollectData.includes('business_address')) {
    businessChanges.push({
      alias: 'business-address-required-to-not-collected',
      old: 'Business address required',
      updated: 'Business address is not collected',
    });
  } else if (
    !old.mustCollectData.includes('business_address') &&
    updated.mustCollectData.includes('business_address')
  ) {
    businessChanges.push({
      alias: 'business-address-not-collected-to-required',
      old: 'Business address is not collected',
      updated: 'Business address required',
    });
  }

  // Business phone number changes
  if (
    old.mustCollectData.includes('business_phone_number') &&
    !updated.mustCollectData.includes('business_phone_number')
  ) {
    businessChanges.push({
      alias: 'business-phone-required-to-not-collected',
      old: 'Business phone number required',
      updated: 'Business phone number is not collected',
    });
  } else if (
    !old.mustCollectData.includes('business_phone_number') &&
    updated.mustCollectData.includes('business_phone_number')
  ) {
    businessChanges.push({
      alias: 'business-phone-not-collected-to-required',
      old: 'Business phone number is not collected',
      updated: 'Business phone number required',
    });
  }

  // Business website changes
  if (old.mustCollectData.includes('business_website') && !updated.mustCollectData.includes('business_website')) {
    businessChanges.push({
      alias: 'business-website-required-to-not-collected',
      old: 'Business website required',
      updated: 'Business website is not collected',
    });
  } else if (
    !old.mustCollectData.includes('business_website') &&
    updated.mustCollectData.includes('business_website')
  ) {
    businessChanges.push({
      alias: 'business-website-not-collected-to-required',
      old: 'Business website is not collected',
      updated: 'Business website required',
    });
  }

  // EIN changes
  if (old.mustCollectData.includes('business_tin') && !updated.mustCollectData.includes('business_tin')) {
    businessChanges.push({
      alias: 'ein-required-to-not-collected',
      old: 'EIN required',
      updated: 'EIN is not collected',
    });
  } else if (!old.mustCollectData.includes('business_tin') && updated.mustCollectData.includes('business_tin')) {
    businessChanges.push({
      alias: 'ein-not-collected-to-required',
      old: 'EIN is not collected',
      updated: 'EIN required',
    });
  }

  // Business type changes
  if (
    old.mustCollectData.includes('business_corporation_type') &&
    !updated.mustCollectData.includes('business_corporation_type')
  ) {
    businessChanges.push({
      alias: 'business-type-required-to-not-collected',
      old: 'Business type required',
      updated: 'Business type is not collected',
    });
  } else if (
    !old.mustCollectData.includes('business_corporation_type') &&
    updated.mustCollectData.includes('business_corporation_type')
  ) {
    businessChanges.push({
      alias: 'business-type-not-collected-to-required',
      old: 'Business type is not collected',
      updated: 'Business type required',
    });
  }

  return businessChanges;
};

const getInvestorQuestionChanges = (old: OnboardingConfiguration, updated: OnboardingConfiguration) => {
  const investorChanges: Array<Diff> = [];

  // Investor questions Required > Not required
  if (old.mustCollectData.includes('investor_profile') && !updated.mustCollectData.includes('investor_profile')) {
    investorChanges.push({
      alias: 'investor-questions-required-to-not-collected',
      old: 'Investor questions required',
      updated: 'Investor questions are not collected',
    });
  }

  // Investor questions Not required > Required
  if (!old.mustCollectData.includes('investor_profile') && updated.mustCollectData.includes('investor_profile')) {
    investorChanges.push({
      alias: 'investor-questions-not-collected-to-required',
      old: 'Investor questions are not collected',
      updated: 'Investor questions required',
    });
  }

  return investorChanges;
};

const getAuthMethodChanges = (old: OnboardingConfiguration, updated: OnboardingConfiguration) => {
  const authChanges: Array<Diff> = [];

  const formatMethods = (methods?: Array<AuthMethodKind>) => {
    if (!methods?.length) return 'none';
    return methods
      .map(method => {
        if (method === 'phone') return 'SMS';
        if (method === 'email') return 'Email';
        return method;
      })
      .join(', ');
  };

  const oldMethods = formatMethods(old.requiredAuthMethods);
  const updatedMethods = formatMethods(updated.requiredAuthMethods);

  if (oldMethods !== updatedMethods) {
    authChanges.push({
      alias: 'auth-methods-list-updated',
      old: oldMethods,
      updated: updatedMethods,
    });
  }

  return authChanges;
};

const getCustomDocsChanges = (old: OnboardingConfiguration, updated: OnboardingConfiguration) => {
  const oldDocs = old.documentsToCollect || [];
  const updatedDocs = updated.documentsToCollect || [];

  const getProofOfAddressChanges = (
    oldDocs: OnboardingConfiguration['documentsToCollect'],
    updatedDocs: OnboardingConfiguration['documentsToCollect'],
  ) => {
    const changes: Array<Diff> = [];

    const oldPOA = oldDocs?.find(doc => doc.kind === 'proof_of_address');
    const updatedPOA = updatedDocs?.find(doc => doc.kind === 'proof_of_address');

    if (oldPOA && !updatedPOA) {
      changes.push({
        alias: 'proof-of-address-removed',
        old: 'Proof of address collected',
        updated: 'Proof of address not collected',
      });
    } else if (!oldPOA && updatedPOA) {
      changes.push({
        alias: 'proof-of-address-added',
        old: 'Proof of address not collected',
        updated: 'Proof of address collected',
      });
    } else if (oldPOA && updatedPOA && oldPOA.data.requiresHumanReview !== updatedPOA.data.requiresHumanReview) {
      changes.push({
        alias: 'proof-of-address-review-requirement-changed',
        old: `Proof of address ${oldPOA.data.requiresHumanReview ? 'requires' : 'does not require'} human review`,
        updated: `Proof of address ${updatedPOA.data.requiresHumanReview ? 'requires' : 'does not require'} human review`,
      });
    }

    return changes;
  };

  const getProofOfSSNChanges = (
    oldDocs: OnboardingConfiguration['documentsToCollect'],
    updatedDocs: OnboardingConfiguration['documentsToCollect'],
  ) => {
    const changes: Array<Diff> = [];

    const oldPOSSN = oldDocs?.find(doc => doc.kind === 'proof_of_ssn');
    const updatedPOSSN = updatedDocs?.find(doc => doc.kind === 'proof_of_ssn');

    if (oldPOSSN && !updatedPOSSN) {
      changes.push({
        alias: 'proof-of-ssn-removed',
        old: 'Proof of SSN collected',
        updated: 'Proof of SSN not collected',
      });
    } else if (!oldPOSSN && updatedPOSSN) {
      changes.push({
        alias: 'proof-of-ssn-added',
        old: 'Proof of SSN not collected',
        updated: 'Proof of SSN collected',
      });
    } else if (
      oldPOSSN &&
      updatedPOSSN &&
      oldPOSSN.data.requiresHumanReview !== updatedPOSSN.data.requiresHumanReview
    ) {
      changes.push({
        alias: 'proof-of-ssn-review-requirement-changed',
        old: `Proof of SSN ${oldPOSSN.data.requiresHumanReview ? 'requires' : 'does not require'} human review`,
        updated: `Proof of SSN ${updatedPOSSN.data.requiresHumanReview ? 'requires' : 'does not require'} human review`,
      });
    }

    return changes;
  };

  const getCustomDocChanges = (
    oldDocs: OnboardingConfiguration['documentsToCollect'],
    updatedDocs: OnboardingConfiguration['documentsToCollect'],
  ) => {
    const changes: Array<Diff> = [];

    const oldCustomDocs = oldDocs?.filter(doc => doc.kind === 'custom') || [];
    const updatedCustomDocs = updatedDocs?.filter(doc => doc.kind === 'custom') || [];

    // Find removed docs
    oldCustomDocs.forEach(oldDoc => {
      const stillExists = updatedCustomDocs.find(updatedDoc => updatedDoc.data.identifier === oldDoc.data.identifier);

      if (!stillExists) {
        changes.push({
          alias: `custom-doc-removed-${oldDoc.data.identifier}`,
          old: `Custom document "${oldDoc.data.identifier}" collected`,
          updated: `Custom document "${oldDoc.data.identifier}" not collected`,
        });
      }
    });

    // Find added docs
    updatedCustomDocs.forEach(updatedDoc => {
      const existedBefore = oldCustomDocs.find(oldDoc => oldDoc.data.identifier === updatedDoc.data.identifier);

      if (!existedBefore) {
        changes.push({
          alias: `custom-doc-added-${updatedDoc.data.identifier}`,
          old: `Custom document "${updatedDoc.data.identifier}" not collected`,
          updated: `Custom document "${updatedDoc.data.identifier}" collected`,
        });
      }
    });

    // Find modified docs
    updatedCustomDocs.forEach(updatedDoc => {
      const oldDoc = oldCustomDocs.find(doc => doc.data.identifier === updatedDoc.data.identifier);

      if (oldDoc) {
        if (oldDoc.data.name !== updatedDoc.data.name) {
          changes.push({
            alias: `custom-doc-name-updated-${updatedDoc.data.identifier}`,
            old: `Custom document "${updatedDoc.data.identifier}" name: "${oldDoc.data.name}"`,
            updated: `Custom document "${updatedDoc.data.identifier}" name: "${updatedDoc.data.name}"`,
          });
        }

        if (oldDoc.data.description !== updatedDoc.data.description) {
          changes.push({
            alias: `custom-doc-description-changed-${updatedDoc.data.identifier}`,
            old: `Custom document description: "${oldDoc.data.description}"`,
            updated: `Custom document description: "${updatedDoc.data.description}"`,
          });
        }

        if (oldDoc.data.requiresHumanReview !== updatedDoc.data.requiresHumanReview) {
          changes.push({
            alias: `custom-doc-review-changed-${updatedDoc.data.identifier}`,
            old: `Custom document ${oldDoc.data.requiresHumanReview ? 'requires' : 'does not require'} human review`,
            updated: `Custom document ${updatedDoc.data.requiresHumanReview ? 'requires' : 'does not require'} human review`,
          });
        }

        if (oldDoc.data.uploadSettings !== updatedDoc.data.uploadSettings) {
          changes.push({
            alias: `custom-doc-upload-settings-changed-${updatedDoc.data.identifier}`,
            old: `Custom document upload settings: "${oldDoc.data.uploadSettings}"`,
            updated: `Custom document upload settings: "${updatedDoc.data.uploadSettings}"`,
          });
        }
      }
    });

    return changes;
  };

  return [
    ...getProofOfAddressChanges(oldDocs, updatedDocs),
    ...getProofOfSSNChanges(oldDocs, updatedDocs),
    ...getCustomDocChanges(oldDocs, updatedDocs),
  ];
};

const getBusinessDocsChanges = (old: OnboardingConfiguration, updated: OnboardingConfiguration) => {
  const oldDocs = old.businessDocumentsToCollect || [];
  const updatedDocs = updated.businessDocumentsToCollect || [];

  const getCustomDocChanges = (
    oldDocs: OnboardingConfiguration['businessDocumentsToCollect'],
    updatedDocs: OnboardingConfiguration['businessDocumentsToCollect'],
  ) => {
    const changes: Array<Diff> = [];

    const oldCustomDocs = oldDocs?.filter(doc => doc.kind === 'custom') || [];
    const updatedCustomDocs = updatedDocs?.filter(doc => doc.kind === 'custom') || [];

    // Find removed docs
    oldCustomDocs.forEach(oldDoc => {
      const stillExists = updatedCustomDocs.find(updatedDoc => updatedDoc.data.identifier === oldDoc.data.identifier);

      if (!stillExists) {
        changes.push({
          alias: `custom-doc-removed-${oldDoc.data.identifier}`,
          old: `Custom document "${oldDoc.data.identifier}" collected`,
          updated: `Custom document "${oldDoc.data.identifier}" not collected`,
        });
      }
    });

    // Find added docs
    updatedCustomDocs.forEach(updatedDoc => {
      const existedBefore = oldCustomDocs.find(oldDoc => oldDoc.data.identifier === updatedDoc.data.identifier);

      if (!existedBefore) {
        changes.push({
          alias: `custom-doc-added-${updatedDoc.data.identifier}`,
          old: `Custom document "${updatedDoc.data.identifier}" not collected`,
          updated: `Custom document "${updatedDoc.data.identifier}" collected`,
        });
      }
    });

    // Find modified docs
    updatedCustomDocs.forEach(updatedDoc => {
      const oldDoc = oldCustomDocs.find(doc => doc.data.identifier === updatedDoc.data.identifier);

      if (oldDoc) {
        if (oldDoc.data.name !== updatedDoc.data.name) {
          changes.push({
            alias: `custom-doc-name-updated-${updatedDoc.data.identifier}`,
            old: `Custom document "${updatedDoc.data.identifier}" name: "${oldDoc.data.name}"`,
            updated: `Custom document "${updatedDoc.data.identifier}" name: "${updatedDoc.data.name}"`,
          });
        }

        if (oldDoc.data.description !== updatedDoc.data.description) {
          changes.push({
            alias: `custom-doc-description-changed-${updatedDoc.data.identifier}`,
            old: `Custom document description: "${oldDoc.data.description}"`,
            updated: `Custom document description: "${updatedDoc.data.description}"`,
          });
        }

        if (oldDoc.data.requiresHumanReview !== updatedDoc.data.requiresHumanReview) {
          changes.push({
            alias: `custom-doc-review-changed-${updatedDoc.data.identifier}`,
            old: `Custom document ${oldDoc.data.requiresHumanReview ? 'requires' : 'does not require'} human review`,
            updated: `Custom document ${updatedDoc.data.requiresHumanReview ? 'requires' : 'does not require'} human review`,
          });
        }

        if (oldDoc.data.uploadSettings !== updatedDoc.data.uploadSettings) {
          changes.push({
            alias: `custom-doc-upload-settings-changed-${updatedDoc.data.identifier}`,
            old: `Custom document upload settings: "${oldDoc.data.uploadSettings}"`,
            updated: `Custom document upload settings: "${updatedDoc.data.uploadSettings}"`,
          });
        }
      }
    });

    return changes;
  };

  return [...getCustomDocChanges(oldDocs, updatedDocs)];
};

const getDocumentTypesAndCountriesChanges = (old: OnboardingConfiguration, updated: OnboardingConfiguration) => {
  const changes: Array<Diff> = [];
  const oldDocConfig = old.documentTypesAndCountries;
  const updatedDocConfig = updated.documentTypesAndCountries;

  if (!oldDocConfig && !updatedDocConfig) return changes;

  // Handle global documents changes
  const oldGlobal = oldDocConfig?.global || [];
  const updatedGlobal = updatedDocConfig?.global || [];

  // Added global documents
  const addedDocs = updatedGlobal.filter(doc => !oldGlobal.includes(doc));
  if (addedDocs.length > 0) {
    changes.push({
      alias: 'global-document-requirement-added',
      old: 'No global document requirement',
      updated: `Added ${addedDocs.join(', ')} as global document requirement`,
    });
  }

  // Removed global documents
  oldGlobal.forEach(doc => {
    if (!updatedGlobal.includes(doc)) {
      changes.push({
        alias: 'global-doc-removed',
        old: `${doc} was required globally`,
        updated: 'Removed global document requirement',
      });
    }
  });

  // Handle country specific changes
  const oldCountrySpecific = oldDocConfig?.countrySpecific || {};
  const updatedCountrySpecific = updatedDocConfig?.countrySpecific || {};

  // Added countries
  Object.entries(updatedCountrySpecific).forEach(([country, docTypes]) => {
    if (!oldCountrySpecific[country]) {
      changes.push({
        alias: 'country-added',
        old: `No requirements for ${country}`,
        updated: `Added ${country} (${(docTypes as Array<string>).join(', ')}) to supported countries`,
      });
    }
  });

  // Removed countries
  Object.keys(oldCountrySpecific).forEach(country => {
    if (!updatedCountrySpecific[country]) {
      changes.push({
        alias: 'country-removed',
        old: `${country} was supported`,
        updated: `Removed ${country} from supported countries`,
      });
    }
  });

  // Check for modified country requirements
  Object.entries(updatedCountrySpecific).forEach(([country, docTypes]) => {
    const oldDocTypes = oldCountrySpecific[country];
    if (oldDocTypes && JSON.stringify(oldDocTypes) !== JSON.stringify(docTypes)) {
      changes.push({
        alias: 'country-docs-modified',
        old: `${country} required: ${(oldDocTypes as Array<string>).join(', ')}`,
        updated: `${country} requires: ${(docTypes as Array<string>).join(', ')}`,
      });
    }
  });

  return changes;
};

const getVerificationCheckChanges = (old: OnboardingConfiguration, updated: OnboardingConfiguration) => {
  const changes: Array<Diff> = [];

  // KYC verification changes
  const oldKyc = old.verificationChecks?.find(check => check.kind === 'kyc');
  const updatedKyc = updated.verificationChecks?.find(check => check.kind === 'kyc');

  if (!oldKyc && updatedKyc) {
    changes.push({
      alias: 'kyc-verification-added',
      old: 'KYC verification not required',
      updated: 'KYC verification required',
    });
  } else if (oldKyc && !updatedKyc) {
    changes.push({
      alias: 'kyc-verification-removed',
      old: 'KYC verification required',
      updated: 'KYC verification not required',
    });
  }

  // KYB verification changes
  const oldKyb = old.verificationChecks?.find(check => check.kind === 'kyb');
  const updatedKyb = updated.verificationChecks?.find(check => check.kind === 'kyb');

  if (!oldKyb && updatedKyb) {
    changes.push({
      alias: 'kyb-verification-added',
      old: 'KYB verification not required',
      updated: 'KYB verification required',
    });
  } else if (oldKyb && !updatedKyb) {
    changes.push({
      alias: 'kyb-verification-removed',
      old: 'KYB verification required',
      updated: 'KYB verification not required',
    });
  }

  if (oldKyb && updatedKyb && oldKyb.data.einOnly !== updatedKyb.data.einOnly) {
    changes.push({
      alias: 'kyb-ein-only-updated',
      old: oldKyb.data.einOnly ? 'EIN only verification' : 'Full KYB verification',
      updated: updatedKyb.data.einOnly ? 'EIN only verification' : 'Full KYB verification',
    });
  }

  // Business AML verification changes
  const oldBusinessAml = old.verificationChecks?.find(check => check.kind === 'business_aml');
  const updatedBusinessAml = updated.verificationChecks?.find(check => check.kind === 'business_aml');

  if (!oldBusinessAml && updatedBusinessAml) {
    changes.push({
      alias: 'business-aml-verification-added',
      old: 'Business AML verification not required',
      updated: 'Business AML verification required',
    });
  } else if (oldBusinessAml && !updatedBusinessAml) {
    changes.push({
      alias: 'business-aml-verification-removed',
      old: 'Business AML verification required',
      updated: 'Business AML verification not required',
    });
  }

  // AML verification changes
  const oldAml = old.verificationChecks?.find(check => check.kind === 'aml')?.data;
  const updatedAml = updated.verificationChecks?.find(check => check.kind === 'aml')?.data;

  if (!oldAml && updatedAml) {
    changes.push({
      alias: 'aml-adverse-media-updated',
      old: 'Adverse media disabled',
      updated: updatedAml.adverseMedia
        ? `Adverse media enabled (${updatedAml.adverseMediaLists?.join(', ') || 'none'})`
        : 'Adverse media disabled',
    });
  } else if (oldAml && updatedAml) {
    if (
      oldAml.adverseMedia !== updatedAml.adverseMedia ||
      !isEqual(oldAml.adverseMediaLists, updatedAml.adverseMediaLists)
    ) {
      changes.push({
        alias: 'aml-adverse-media-updated',
        old: oldAml.adverseMedia
          ? `Adverse media enabled (${oldAml.adverseMediaLists?.join(', ') || 'none'})`
          : 'Adverse media disabled',
        updated: updatedAml.adverseMedia
          ? `Adverse media enabled (${updatedAml.adverseMediaLists?.join(', ') || 'none'})`
          : 'Adverse media disabled',
      });
    }
  }

  if (oldAml?.ofac !== updatedAml?.ofac) {
    changes.push({
      alias: 'aml-ofac-updated',
      old: oldAml?.ofac ? 'OFAC enabled' : 'OFAC disabled',
      updated: updatedAml?.ofac ? 'OFAC enabled' : 'OFAC disabled',
    });
  }

  if (oldAml?.pep !== updatedAml?.pep) {
    changes.push({
      alias: 'aml-pep-updated',
      old: oldAml?.pep ? 'PEP enabled' : 'PEP disabled',
      updated: updatedAml?.pep ? 'PEP enabled' : 'PEP disabled',
    });
  }

  if (oldAml?.matchKind !== updatedAml?.matchKind) {
    changes.push({
      alias: 'aml-match-kind-updated',
      old: `Match kind: ${oldAml?.matchKind || 'none'}`,
      updated: `Match kind: ${updatedAml?.matchKind || 'none'}`,
    });
  }

  // Neuro ID verification changes
  const oldNeuroId = old.verificationChecks?.find(check => check.kind === 'neuro_id');
  const updatedNeuroId = updated.verificationChecks?.find(check => check.kind === 'neuro_id');

  if (!oldNeuroId && updatedNeuroId) {
    changes.push({
      alias: 'neuro-id-added',
      old: 'Neuro ID verification disabled',
      updated: 'Neuro ID verification enabled',
    });
  } else if (oldNeuroId && !updatedNeuroId) {
    changes.push({
      alias: 'neuro-id-removed',
      old: 'Neuro ID verification enabled',
      updated: 'Neuro ID verification disabled',
    });
  }

  // Sentilink verification changes
  const oldSentilink = old.verificationChecks?.find(check => check.kind === 'sentilink');
  const updatedSentilink = updated.verificationChecks?.find(check => check.kind === 'sentilink');

  if (!oldSentilink && updatedSentilink) {
    changes.push({
      alias: 'sentilink-added',
      old: 'Sentilink verification disabled',
      updated: 'Sentilink verification enabled',
    });
  } else if (oldSentilink && !updatedSentilink) {
    changes.push({
      alias: 'sentilink-removed',
      old: 'Sentilink verification enabled',
      updated: 'Sentilink verification disabled',
    });
  }

  return changes;
};

const createDiff = (old: OnboardingConfiguration, updated: OnboardingConfiguration) => {
  const diff: Array<Changes> = [];
  const getBasicInfo = getBasicInfoChanges(old, updated);

  // Name
  if (old.name !== updated.name) {
    diff.push({ label: 'Name', changes: [{ alias: 'playbook-name-updated', old: old.name, updated: updated.name }] });
  }

  // Residency
  const residency = getResidencyChanges(old, updated);
  if (residency.length) {
    diff.push({ label: 'Residency', changes: residency });
  }

  // Basic info
  const basicInfo = getBasicInfo();
  if (basicInfo.length) {
    diff.push({ label: 'Basic information', changes: basicInfo });
  }

  // Business info
  const businessInfo = getBusinessChanges(old, updated);
  if (businessInfo.length) {
    diff.push({ label: 'Business information', changes: businessInfo });
  }

  // Investor questions
  const investorQuestions = getInvestorQuestionChanges(old, updated);
  if (investorQuestions.length) {
    diff.push({ label: 'Investor profile questions', changes: investorQuestions });
  }

  // Authentication methods
  const authMethods = getAuthMethodChanges(old, updated);
  if (authMethods.length) {
    diff.push({ label: 'Authentication methods', changes: authMethods });
  }

  // Document types and countries
  const docTypesAndCountries = getDocumentTypesAndCountriesChanges(old, updated);
  if (docTypesAndCountries.length) {
    diff.push({ label: 'Document Types and Countries', changes: docTypesAndCountries });
  }

  // Custom documents
  const customDocs = getCustomDocsChanges(old, updated);
  if (customDocs.length) {
    diff.push({ label: 'Document requirements', changes: customDocs });
  }

  // Business custom documents
  const businessDocs = getBusinessDocsChanges(old, updated);
  if (businessDocs.length) {
    diff.push({ label: 'Business document requirements', changes: businessDocs });
  }

  // Verification checks
  const verificationChecks = getVerificationCheckChanges(old, updated);
  if (verificationChecks.length) {
    diff.push({ label: 'Verification checks', changes: verificationChecks });
  }

  return diff;
};

export default createDiff;
