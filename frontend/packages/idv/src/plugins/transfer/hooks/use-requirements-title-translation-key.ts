import { useTranslation } from 'react-i18next';

import type { TransferRequirements } from '../types';

const useRequirementsTitle = (
  missingRequirements: TransferRequirements,
  isContinuingOnDesktop: boolean,
) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'transfer.components.requirements',
  });
  const { liveness, idDoc } = missingRequirements;

  const transferringLiveness = !!liveness;
  // If transferring to desktop, we won't run id doc in other tab
  const transferringIdDoc = !!idDoc && !isContinuingOnDesktop;

  if (transferringLiveness && transferringIdDoc) {
    return {
      title: t('title.liveness-with-id-doc'),
      linkSentToPhoneSubtitle: t('subtitle.liveness-with-id-doc'),
    };
  }
  if (transferringLiveness) {
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
