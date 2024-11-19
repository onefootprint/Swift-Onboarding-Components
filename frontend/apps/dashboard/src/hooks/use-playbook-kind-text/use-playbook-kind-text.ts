import type { ObConfigurationKind } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';

const usePlaybookKindText = () => {
  const { t } = useTranslation('common', { keyPrefix: 'playbook-kind' });

  return (kind: ObConfigurationKind) => {
    if (kind === 'kyc') {
      return t('kyc');
    }
    if (kind === 'kyb') {
      return t('kyb');
    }
    if (kind === 'auth') {
      return t('auth');
    }
    if (kind === 'document') {
      return t('document');
    }
    return t('unknown');
  };
};

export default usePlaybookKindText;
