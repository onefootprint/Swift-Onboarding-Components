import { DocumentRequestKind } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const useGuidelines = (docKind: DocumentRequestKind) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.non-id-doc.pages.document-prompt.guidelines',
  });
  const dockindToGuidelines: Record<DocumentRequestKind, string[]> = {
    [DocumentRequestKind.ProofOfAddress]: [
      t('gas-water-electricity-bill'),
      t('bank-credit-card-statement'),
      t('vehicle-voter-registration'),
      t('rental-agreement'),
      t('phone-internet-bill'),
    ],
    [DocumentRequestKind.ProofOfSsn]: [],
    [DocumentRequestKind.Identity]: [],
    [DocumentRequestKind.Custom]: [],
  };

  return dockindToGuidelines[docKind];
};

export default useGuidelines;
