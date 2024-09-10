import { useTranslation } from 'react-i18next';
import Notification from '../../../notification';

const InvalidAuthConfig = () => {
  const { t } = useTranslation('common');

  return (
    <Notification title={t('notification.invalid-kind-title')} subtitle={t('notification.invalid-kind-description')} />
  );
};

export default InvalidAuthConfig;
