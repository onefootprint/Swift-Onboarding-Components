import { OnboardingConfigKind } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';

const useDefaultName = ({ kind }: { kind: OnboardingConfigKind }) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'kinds' });
  const {
    data: { org },
  } = useSession();
  const tenantName = org?.name || '';
  const dateString = new Date().toLocaleString('en-us', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });

  const getKindName = (kind: OnboardingConfigKind) => {
    if (kind === OnboardingConfigKind.auth) {
      return t('auth');
    }
    if (kind === OnboardingConfigKind.kyb) {
      return t('kyb');
    }
    if (kind === OnboardingConfigKind.kyc) {
      return t('kyc');
    }
    if (kind === OnboardingConfigKind.document) {
      return t('document');
    }
    return 'Unknown';
  };

  return `${tenantName} ${getKindName(kind)} (${dateString})`;
};

export default useDefaultName;
