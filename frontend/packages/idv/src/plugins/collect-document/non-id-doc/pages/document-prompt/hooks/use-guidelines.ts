import { DocumentRequestKind } from '@onefootprint/types';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { useTranslation } from 'react-i18next';

const useGuidelines = ({ docKind, orgId }: { docKind: DocumentRequestKind; orgId: string }) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.non-id-doc.pages.document-prompt.guidelines',
  });
  const { NoBankCreditCardStatementForPoA } = useFlags();
  const orgIds = new Set<string>(NoBankCreditCardStatementForPoA);
  const shouldOmitBankCreditCardStatement = orgIds.has(orgId);
  const poaGuidelines = [
    t('gas-water-electricity-bill'),
    t('vehicle-voter-registration'),
    t('rental-agreement'),
    t('phone-internet-bill'),
  ];
  if (!shouldOmitBankCreditCardStatement) {
    poaGuidelines.push(t('bank-credit-card-statement'));
  }
  const dockindToGuidelines: Record<DocumentRequestKind, string[]> = {
    [DocumentRequestKind.ProofOfAddress]: poaGuidelines,
    [DocumentRequestKind.ProofOfSsn]: [],
    [DocumentRequestKind.Identity]: [],
    [DocumentRequestKind.Custom]: [],
  };

  return dockindToGuidelines[docKind];
};

export default useGuidelines;
