import { useTranslation } from 'react-i18next';

import type { TransferRequirements } from '../types';

const useRequirementsTitle = (missingRequirements: TransferRequirements) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'transfer.components.requirements-title',
  });
  const { liveness, idDoc } = missingRequirements;

  if (liveness && idDoc) {
    return t('liveness-with-id-doc');
  }
  if (liveness) {
    return t('liveness');
  }
  return t('id-doc');
};

export default useRequirementsTitle;
