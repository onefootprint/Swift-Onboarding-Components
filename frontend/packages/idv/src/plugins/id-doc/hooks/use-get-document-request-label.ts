import { DocumentRequestKind } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const useGetDocumentRequestLabel = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'id-doc.document-request-kind',
  });
  return (kind: DocumentRequestKind) => {
    const translations: Record<DocumentRequestKind, string> = {
      [DocumentRequestKind.Identity]: t('identity'),
      [DocumentRequestKind.ProofOfAddress]: t('proof_of_address'),
      [DocumentRequestKind.ProofOfSsn]: t('proof_of_ssn'),
      [DocumentRequestKind.Custom]: t('unknown'),
    };
    if (kind in translations) {
      return translations[kind];
    }
    // Catch-all in case we add a new enum variant on the backend
    return t('unknown');
  };
};

export default useGetDocumentRequestLabel;
