import { useTranslation } from 'react-i18next';
import Notification from '../../../notification';

const InvalidDomain = () => {
  const { t } = useTranslation('common');

  return (
    <Notification
      title={t('notification.invalid-domain-title')}
      subtitle={t('notification.invalid-domain-description')}
    />
  );
};

export default InvalidDomain;
