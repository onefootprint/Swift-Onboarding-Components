import { useTranslation } from 'react-i18next';
import Notification from '../notification';

const PasskeyError = () => {
  const { t } = useTranslation('common');

  return (
    <Notification variant="error" title={t('error-registering-passkey')} subtitle={t('try-again-close-this-window')} />
  );
};

export default PasskeyError;
