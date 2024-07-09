import { PlaybookKind } from '@/playbooks/utils/machine/types';
import { useTranslation } from 'react-i18next';

const usePlaybookKindText = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'kinds' });

  return (kind: PlaybookKind) => {
    if (kind === PlaybookKind.Auth) {
      return t('auth');
    }
    if (kind === PlaybookKind.Kyb) {
      return t('kyb');
    }
    if (kind === PlaybookKind.Kyc) {
      return t('kyc');
    }
    if (kind === PlaybookKind.DocOnly) {
      return t('document');
    }
    return 'Uknown';
  };
};

export default usePlaybookKindText;
