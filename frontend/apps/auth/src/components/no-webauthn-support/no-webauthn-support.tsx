import { useTranslation } from 'react-i18next';
import Notification from '../notification';

const NoWebauthnSupport = () => {
  const { t } = useTranslation('common');

  return (
    <Notification
      variant="error"
      title={t('webauthn-not-supported')}
      subtitle={t('webauthn-not-supported-suggestion')}
    />
  );
};

export default NoWebauthnSupport;
