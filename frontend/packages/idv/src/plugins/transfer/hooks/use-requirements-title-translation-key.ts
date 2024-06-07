import { useTranslation } from 'react-i18next';

import type { TransferRequirements } from '../types';
import useGetDocumentRequestLabel from './use-get-document-request-label';

const useRequirementsTitle = (missingRequirements: TransferRequirements, isContinuingOnDesktop: boolean) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'transfer.components.requirements',
  });
  const getDocumentRequestLabel = useGetDocumentRequestLabel();
  const { liveness, documents } = missingRequirements;

  const transferringLiveness = !!liveness;
  // If transferring to desktop, we won't run id doc in other tab
  const transferringIdDoc = !!documents.length && !isContinuingOnDesktop;

  const documentKind = documents.length === 1 ? getDocumentRequestLabel(documents[0].config.kind) : t('documents');

  if (transferringLiveness && transferringIdDoc) {
    return {
      title: t('title.liveness-with-id-doc', { documentKind }),
      linkSentToPhoneSubtitle: t('subtitle.liveness-with-id-doc', {
        documentKind,
      }),
    };
  }
  if (transferringIdDoc) {
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
