import { useTranslation } from 'react-i18next';

import type { TransferRequirements } from '../types';

const useRequirementsTitle = (missingRequirements: TransferRequirements) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'transfer.components.requirements',
  });
  const { liveness, idDoc } = missingRequirements;

  if (liveness && idDoc) {
    return {
      title: t('title.liveness-with-id-doc'),
      linkSentToPhoneSubtitle: t('subtitle.liveness-with-id-doc'),
    };
  }
  if (liveness) {
    return {
      title: t('title.liveness'),
      linkSentToPhoneSubtitle: t('subtitle.liveness'),
    };
  }
  return {
    title: t('title.id-doc'),
    linkSentToPhoneSubtitle: t('subtitle.id-doc'),
  };
};

export default useRequirementsTitle;
