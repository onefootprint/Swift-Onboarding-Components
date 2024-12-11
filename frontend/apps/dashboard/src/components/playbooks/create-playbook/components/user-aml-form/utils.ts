import type {
  AdverseMediaListKind,
  AmlMatchKind,
  OnboardingConfiguration,
  VerificationCheckAml,
} from '@onefootprint/request-types/dashboard';
import type { UserAmlFormData } from './user-aml-form.types';

const createAdverseMediaLists = (adverseMediaList: UserAmlFormData['aml']['adverseMediaList']) => {
  const payload: AdverseMediaListKind[] = [];
  if (adverseMediaList.financial_crime) payload.push('financial_crime');
  if (adverseMediaList.violent_crime) payload.push('violent_crime');
  if (adverseMediaList.sexual_crime) payload.push('sexual_crime');
  if (adverseMediaList.cyber_crime) payload.push('cyber_crime');
  if (adverseMediaList.terrorism) payload.push('terrorism');
  if (adverseMediaList.fraud) payload.push('fraud');
  if (adverseMediaList.narcotics) payload.push('narcotics');
  if (adverseMediaList.general_serious) payload.push('general_serious');
  if (adverseMediaList.general_minor) payload.push('general_minor');
  return payload;
};

export const createUserAmlVerificationChecksPayload = (
  verificationChecksForm: UserAmlFormData,
): VerificationCheckAml[] => {
  return verificationChecksForm.aml.enhancedAml
    ? [
        {
          kind: 'aml' as const,
          data: {
            continuousMonitoring: true,
            ofac: verificationChecksForm.aml.ofac,
            pep: verificationChecksForm.aml.pep,
            adverseMedia: verificationChecksForm.aml.adverseMedia,
            adverseMediaLists: createAdverseMediaLists(verificationChecksForm.aml.adverseMediaList),
            matchKind:
              verificationChecksForm.aml.matchingMethod.kind === 'fuzzy'
                ? verificationChecksForm.aml.matchingMethod.fuzzyLevel
                : verificationChecksForm.aml.matchingMethod.exactLevel,
          },
        },
      ]
    : [];
};

export const createUserAmlFormData = (playbook: OnboardingConfiguration): UserAmlFormData => {
  const amlCheck = playbook.verificationChecks.find(c => c.kind === 'aml');

  const getMatchingMethod = (matchingMethod: AmlMatchKind = 'fuzzy_low'): UserAmlFormData['aml']['matchingMethod'] => {
    const isFuzzy = matchingMethod.startsWith('fuzzy');

    const getFuzzyLevel = () => {
      if (matchingMethod === 'fuzzy_low' || matchingMethod === 'fuzzy_medium' || matchingMethod === 'fuzzy_high') {
        return matchingMethod;
      }
      return 'fuzzy_low';
    };

    const getExactLevel = () => {
      if (matchingMethod === 'exact_name' || matchingMethod === 'exact_name_and_dob_year') {
        return matchingMethod;
      }
      return 'exact_name';
    };

    return {
      kind: isFuzzy ? 'fuzzy' : 'exact',
      fuzzyLevel: getFuzzyLevel(),
      exactLevel: getExactLevel(),
    };
  };

  return {
    aml: {
      enhancedAml: Boolean(amlCheck),
      ofac: Boolean(amlCheck?.data.ofac),
      pep: Boolean(amlCheck?.data.pep),
      adverseMedia: Boolean(amlCheck?.data.adverseMedia),
      adverseMediaList: {
        financial_crime: Boolean(amlCheck?.data.adverseMediaLists?.includes('financial_crime')),
        violent_crime: Boolean(amlCheck?.data.adverseMediaLists?.includes('violent_crime')),
        sexual_crime: Boolean(amlCheck?.data.adverseMediaLists?.includes('sexual_crime')),
        cyber_crime: Boolean(amlCheck?.data.adverseMediaLists?.includes('cyber_crime')),
        terrorism: Boolean(amlCheck?.data.adverseMediaLists?.includes('terrorism')),
        fraud: Boolean(amlCheck?.data.adverseMediaLists?.includes('fraud')),
        narcotics: Boolean(amlCheck?.data.adverseMediaLists?.includes('narcotics')),
        general_serious: Boolean(amlCheck?.data.adverseMediaLists?.includes('general_serious')),
        general_minor: Boolean(amlCheck?.data.adverseMediaLists?.includes('general_minor')),
      },
      hasOptionSelected: true,
      matchingMethod: getMatchingMethod(amlCheck?.data.matchKind),
    },
  };
};
