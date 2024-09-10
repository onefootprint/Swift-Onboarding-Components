import { useTranslation } from 'react-i18next';
import Notification from '../notification';

const PasskeyCancelled = () => {
  const { t } = useTranslation('common');

  return <Notification variant="error" title={t('passkey-registration-cancelled')} subtitle={t('try-again-later')} />;
};

export default PasskeyCancelled;
