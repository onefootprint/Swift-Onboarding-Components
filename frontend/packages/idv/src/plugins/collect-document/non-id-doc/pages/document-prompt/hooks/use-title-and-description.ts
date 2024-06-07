import type { DocumentRequirementConfig } from '@onefootprint/types';
import { DocumentRequestKind } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

import getCustomDocInfo from '../../../utils/get-custom-doc-info';

const useTitleAndDescription = (config: DocumentRequirementConfig) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.non-id-doc.pages.document-prompt',
  });
  const { kind: documentKind } = config;
  if (documentKind === DocumentRequestKind.Identity) {
    return {
      title: '',
      description: '',
    };
  }
  const { documentName, documentDescription } = getCustomDocInfo(config);
  const docKindToTitle: Record<Exclude<DocumentRequestKind, 'identity'>, string> = {
    [DocumentRequestKind.ProofOfAddress]: t('proof-of-address.title'),
    [DocumentRequestKind.ProofOfSsn]: t('proof-of-ssn.title'),
    [DocumentRequestKind.Custom]: t('custom.title', { documentName }),
  };

  const docKindToDescription: Record<Exclude<DocumentRequestKind, 'identity'>, string> = {
    [DocumentRequestKind.ProofOfAddress]: t('proof-of-address.description'),
    [DocumentRequestKind.ProofOfSsn]: t('proof-of-ssn.description'),
    [DocumentRequestKind.Custom]: t('custom.description', {
      documentDescription,
    }),
  };
  return {
    title: docKindToTitle[documentKind],
    description: docKindToDescription[documentKind],
  };
};

export default useTitleAndDescription;
