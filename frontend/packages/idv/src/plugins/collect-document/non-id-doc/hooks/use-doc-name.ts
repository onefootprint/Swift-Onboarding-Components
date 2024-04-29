import type { DocumentRequirementConfig } from '@onefootprint/types';
import { DocumentRequestKind } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

import getCustomDocInfo from '../utils/get-custom-doc-info';

const useDocName = (config: DocumentRequirementConfig): string => {
  const docKind = config.kind;
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.non-id-doc.global.doc-name',
  });
  if (docKind === DocumentRequestKind.Identity) return '';

  const docKindToDocName: Record<
    Exclude<DocumentRequestKind, 'identity'>,
    string
  > = {
    [DocumentRequestKind.ProofOfAddress]: t('proof-of-address'),
    [DocumentRequestKind.ProofOfSsn]: t('proof-of-ssn'),
    [DocumentRequestKind.Custom]: getCustomDocInfo(config).documentName || '',
  };

  return docKindToDocName[docKind];
};

export default useDocName;
