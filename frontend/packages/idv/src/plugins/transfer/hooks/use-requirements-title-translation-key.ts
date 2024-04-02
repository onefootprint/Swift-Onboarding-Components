import { useTranslation } from 'react-i18next';

import useGetDocumentRequestLabel from '../../id-doc/hooks/use-get-document-request-label';
import type { TransferRequirements } from '../types';

const useRequirementsTitle = (
  missingRequirements: TransferRequirements,
  isContinuingOnDesktop: boolean,
) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'transfer.components.requirements',
  });
  const getDocumentRequestLabel = useGetDocumentRequestLabel();
  const { liveness, idDoc } = missingRequirements;

  const transferringLiveness = !!liveness;
  // If transferring to desktop, we won't run id doc in other tab
  const transferringIdDoc = !!idDoc && !isContinuingOnDesktop;

  if (transferringLiveness && transferringIdDoc) {
    const documentKind = getDocumentRequestLabel(idDoc.documentRequestKind);
    return {
      title: t('title.liveness-with-id-doc', { documentKind }),
      linkSentToPhoneSubtitle: t('subtitle.liveness-with-id-doc', {
        documentKind,
      }),
    };
  }
  if (transferringIdDoc) {
    const documentKind = getDocumentRequestLabel(idDoc.documentRequestKind);
    return {
      title: t('title.id-doc', { documentKind }),
      linkSentToPhoneSubtitle: t('subtitle.id-doc', { documentKind }),
    };
  }
  return {
    title: t('title.liveness'),
    linkSentToPhoneSubtitle: t('subtitle.liveness'),
  };
};

export default useRequirementsTitle;
