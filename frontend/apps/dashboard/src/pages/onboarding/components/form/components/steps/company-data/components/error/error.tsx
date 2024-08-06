import { IcoForbid40 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import { EmptyState } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type ErrorProps = {
  error: unknown;
};

const ErrorComponent = ({ error }: ErrorProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });

  return <EmptyState description={getErrorMessage(error)} iconComponent={IcoForbid40} title={t('error')} />;
};

export default ErrorComponent;
