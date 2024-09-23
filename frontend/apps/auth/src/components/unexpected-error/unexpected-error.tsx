import { useTranslation } from 'react-i18next';
import Notification from '../notification';

const UnexpectedError = () => {
  const { t } = useTranslation('common');

  return <Notification variant="error" title={t('unexpected-error')} subtitle={t('unexpected-error-subtitle')} />;
};

export default UnexpectedError;
