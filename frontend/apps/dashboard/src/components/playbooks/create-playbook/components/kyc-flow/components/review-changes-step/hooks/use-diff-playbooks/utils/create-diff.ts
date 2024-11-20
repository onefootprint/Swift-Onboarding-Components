import type { AuthMethodKind, OnboardingConfiguration } from '@onefootprint/request-types/dashboard';

type Diff = { alias: string; old: string; updated: string };

const getResidencyChanges = (old: OnboardingConfiguration, updated: OnboardingConfiguration) => {
  const residencyChanges: Array<Diff> = [];

  // US to International
  if (old.allowUsResidents && updated.allowInternationalResidents) {
    const updatedText = updated.internationalCountryRestrictions?.length
      ? `International residents (${updated.internationalCountryRestrictions.join(', ')})`
      : 'International residents (all countries)';

    residencyChanges.push({
      alias: 'us-to-international',
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
      alias: 'international-to-us',
      old: oldText,
      updated: updated.allowUsTerritoryResidents ? 'US and US territory residents' : 'US residents',
    });
  }

  // US Territory changes
  if (old.allowUsResidents && updated.allowUsResidents) {
    if (!old.allowUsTerritoryResidents && updated.allowUsTerritoryResidents) {
      residencyChanges.push({
        alias: 'add-us-territory',
        old: 'US residents',
        updated: 'US and US territory residents',
      });
    } else if (old.allowUsTerritoryResidents && !updated.allowUsTerritoryResidents) {
      residencyChanges.push({
        alias: 'remove-us-territory',
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
        alias: 'add-country-restrictions',
        old: 'International residents (all countries)',
        updated: `International residents (${updatedCountries.join(', ')})`,
      });
    } else if (oldCountries.length > 0 && updatedCountries.length === 0) {
      residencyChanges.push({
        alias: 'remove-country-restrictions',
        old: `International residents (${oldCountries.join(', ')})`,
        updated: 'International residents (all countries)',
      });
    } else if (
      oldCountries.length > 0 &&
      updatedCountries.length > 0 &&
      oldCountries.join(',') !== updatedCountries.join(',')
    ) {
      residencyChanges.push({
        alias: 'update-country-restrictions',
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
      ssnChanges.push({ alias: 'ssn9-is-ssn4', old: 'SSN (Full)', updated: 'SSN (Last 4) ' });
    } else if (old.mustCollectData.includes('ssn4') && updated.mustCollectData.includes('ssn9')) {
      ssnChanges.push({ alias: 'ssn4-is-ssn9', old: 'SSN (Last 4)', updated: 'SSN (Full)' });
    }

    // SSN Required > Optional
    if (old.mustCollectData.includes('ssn9') && updated.optionalData.includes('ssn9')) {
      ssnChanges.push({
        alias: 'ssn-required-to-optional',
        old: 'SSN (Full) required',
        updated: 'SSN (Full) optional',
      });
    } else if (old.mustCollectData.includes('ssn9') && updated.optionalData.includes('ssn4')) {
      ssnChanges.push({
        alias: 'ssn-required-to-optional',
        old: 'SSN (Full) required',
        updated: 'SSN (Last 4) optional',
      });
    } else if (
      old.mustCollectData.includes('ssn4') &&
      (updated.optionalData.includes('ssn9') || updated.optionalData.includes('ssn4'))
    ) {
      ssnChanges.push({
        alias: 'ssn-required-to-optional',
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
      ssnChanges.push({ alias: 'ssn-9-skipped', old: 'SSN (Full) required', updated: 'SSN (Full) is not collected' });
    } else if (
      old.mustCollectData.includes('ssn4') &&
      !updated.mustCollectData.includes('ssn4') &&
      !updated.optionalData.includes('ssn4') &&
      !updated.mustCollectData.includes('ssn9') &&
      !updated.optionalData.includes('ssn9')
    ) {
      ssnChanges.push({
        alias: 'ssn-4-skipped',
        old: 'SSN (Last 4) required',
        updated: 'SSN (Last 4) is not collected',
      });
    }

    // US Tax ID changes
    if (old.mustCollectData.includes('us_tax_id') && !updated.mustCollectData.includes('us_tax_id')) {
      ssnChanges.push({
        alias: 'us-tax-id-skipped',
        old: 'US Tax ID required',
        updated: 'US Tax ID is not collected',
      });
    } else if (!old.mustCollectData.includes('us_tax_id') && updated.mustCollectData.includes('us_tax_id')) {
      ssnChanges.push({
        alias: 'us-tax-id-required',
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
        alias: 'legal-status-skipped',
        old: 'US Legal Status required',
        updated: 'US Legal Status is not collected',
      });
    }

    // Legal status Not required > Required
    if (!old.mustCollectData.includes('us_legal_status') && updated.mustCollectData.includes('us_legal_status')) {
      legalStatusChanges.push({
        alias: 'legal-status-required',
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

const getInvestorQuestionChanges = (old: OnboardingConfiguration, updated: OnboardingConfiguration) => {
  const investorChanges: Array<Diff> = [];

  // Investor questions Required > Not required
  if (old.mustCollectData.includes('investor_profile') && !updated.mustCollectData.includes('investor_profile')) {
    investorChanges.push({
      alias: 'investor-questions-skipped',
      old: 'Investor questions required',
      updated: 'Investor questions are not collected',
    });
  }

  // Investor questions Not required > Required
  if (!old.mustCollectData.includes('investor_profile') && updated.mustCollectData.includes('investor_profile')) {
    investorChanges.push({
      alias: 'investor-questions-required',
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
      alias: 'auth-methods-updated',
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
        alias: 'poa-removed',
        old: 'Proof of address collected',
        updated: 'Proof of address not collected',
      });
    } else if (!oldPOA && updatedPOA) {
      changes.push({
        alias: 'poa-added',
        old: 'Proof of address not collected',
        updated: 'Proof of address collected',
      });
    } else if (oldPOA && updatedPOA && oldPOA.data.requiresHumanReview !== updatedPOA.data.requiresHumanReview) {
      changes.push({
        alias: 'poa-review-changed',
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
        alias: 'possn-removed',
        old: 'Proof of SSN collected',
        updated: 'Proof of SSN not collected',
      });
    } else if (!oldPOSSN && updatedPOSSN) {
      changes.push({
        alias: 'possn-added',
        old: 'Proof of SSN not collected',
        updated: 'Proof of SSN collected',
      });
    } else if (
      oldPOSSN &&
      updatedPOSSN &&
      oldPOSSN.data.requiresHumanReview !== updatedPOSSN.data.requiresHumanReview
    ) {
      changes.push({
        alias: 'possn-review-changed',
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
          alias: 'custom-doc-removed',
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
          alias: 'custom-doc-added',
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
            alias: 'custom-doc-name-updated',
            old: `Custom document "${updatedDoc.data.identifier}" name: "${oldDoc.data.name}"`,
            updated: `Custom document "${updatedDoc.data.identifier}" name: "${updatedDoc.data.name}"`,
          });
        }

        if (oldDoc.data.description !== updatedDoc.data.description) {
          changes.push({
            alias: 'custom-doc-description-changed',
            old: `Custom document description: "${oldDoc.data.description}"`,
            updated: `Custom document description: "${updatedDoc.data.description}"`,
          });
        }

        if (oldDoc.data.requiresHumanReview !== updatedDoc.data.requiresHumanReview) {
          changes.push({
            alias: 'custom-doc-review-changed',
            old: `Custom document ${oldDoc.data.requiresHumanReview ? 'requires' : 'does not require'} human review`,
            updated: `Custom document ${updatedDoc.data.requiresHumanReview ? 'requires' : 'does not require'} human review`,
          });
        }

        if (oldDoc.data.uploadSettings !== updatedDoc.data.uploadSettings) {
          changes.push({
            alias: 'custom-doc-upload-settings-changed',
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

const createDiff = (old: OnboardingConfiguration, updated: OnboardingConfiguration) => {
  const diff: Array<{ label: string; changes: Array<Diff> }> = [];
  const getBasicInfo = getBasicInfoChanges(old, updated);

  // Name
  if (old.name !== updated.name) {
    diff.push({ label: 'Name', changes: [{ alias: 'name-updated', old: old.name, updated: updated.name }] });
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

  // Custom documents
  const customDocs = getCustomDocsChanges(old, updated);
  if (customDocs.length) {
    diff.push({ label: 'Document requirements', changes: customDocs });
  }

  return diff;
};

export default createDiff;
