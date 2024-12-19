import { useTranslation } from 'react-i18next';

const useRegistrationStatusText = () => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.registrations.status' });

  return (status: string) => {
    if (status === 'unknown') {
      return t('unknown');
    }
    if (status === 'active') {
      return t('active');
    }
    if (status === 'inactive') {
      return t('inactive');
    }
  };
};

export default useRegistrationStatusText;
