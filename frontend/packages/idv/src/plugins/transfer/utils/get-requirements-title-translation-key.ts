import type { ParseKeys } from 'i18next';

import type { TransferRequirements } from '../types';

const getRequirementsTitleTranslationKey = (
  missingRequirements: TransferRequirements,
): ParseKeys<'idv', {}> => {
  const { liveness, idDoc } = missingRequirements;

  let key = '';
  if (liveness && idDoc) {
    key = 'liveness-with-id-doc';
  } else if (liveness) {
    key = 'liveness';
  } else {
    key = 'id-doc';
  }

  return `transfer.components.requirements-title.${key}` as ParseKeys<
    'idv',
    {}
  >;
};

export default getRequirementsTitleTranslationKey;
