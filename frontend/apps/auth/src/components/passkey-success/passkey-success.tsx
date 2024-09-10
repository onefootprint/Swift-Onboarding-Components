import { useTranslation } from 'react-i18next';
import Notification from '../notification';

const PasskeySuccess = () => {
  const { t } = useTranslation('common');

  return (
    <Notification variant="success" title={t('passkey-added-successfully')} subtitle={t('you-can-close-this-window')} />
  );
};

export default PasskeySuccess;
