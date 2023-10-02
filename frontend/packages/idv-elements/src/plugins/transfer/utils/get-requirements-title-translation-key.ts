import type { TransferRequirements } from '../types';

const getRequirementsTitleTranslationKey = (
  missingRequirements: TransferRequirements,
): string => {
  const { liveness, idDoc } = missingRequirements;

  let key = '';
  if (liveness && idDoc) {
    key = 'liveness-with-id-doc';
  } else if (liveness) {
    key = 'liveness';
  } else {
    key = 'id-doc';
  }

  return `components.requirements-title.${key}`;
};

export default getRequirementsTitleTranslationKey;
