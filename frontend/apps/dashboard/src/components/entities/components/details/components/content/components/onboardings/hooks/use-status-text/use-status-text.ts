import type { OnboardingStatus } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';

const useStatusText = () => {
  const { t } = useTranslation('common', { keyPrefix: 'entity-statuses' });

  return (status: OnboardingStatus) => {
    if (status === 'pass') {
      return t('pass');
    }
    if (status === 'fail') {
      return t('fail');
    }
    if (status === 'none') {
      return t('none');
    }
    if (status === 'incomplete') {
      return t('incomplete');
    }
    if (status === 'pending') {
      return t('pending');
    }
    return '-';
  };
};

export default useStatusText;
