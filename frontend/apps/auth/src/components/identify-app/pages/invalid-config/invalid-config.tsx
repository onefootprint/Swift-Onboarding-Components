import { useTranslation } from 'react-i18next';
import Notification from '../../../notification';

const InvalidConfig = () => {
  const { t } = useTranslation('common');

  return (
    <Notification title={t('notification.invalid-config-title')} subtitle={t('notification.invalid-config-subtitle')} />
  );
};

export default InvalidConfig;
