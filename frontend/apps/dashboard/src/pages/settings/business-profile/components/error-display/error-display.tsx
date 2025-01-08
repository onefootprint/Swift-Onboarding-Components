import { useTranslation } from 'react-i18next';

export type ErrorDisplayProps = {
  message: string;
};

const ErrorDisplay = ({ message }: ErrorDisplayProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });

  return (
    <div className="flex flex-col" aria-label={t('error')}>
      <div className="text-label-3 text-tertiary mb-1">{t('error')}</div>
      <div className="text-body-3">{message}</div>
    </div>
  );
};

export default ErrorDisplay;
