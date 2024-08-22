import { Box, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

export type ErrorDisplayProps = {
  message: string;
};

const ErrorDisplay = ({ message }: ErrorDisplayProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });
  return (
    <Box aria-label={t('error')}>
      <Text variant="label-3" color="tertiary" marginBottom={2}>
        {t('error')}
      </Text>
      <Text variant="body-3">{message}</Text>
    </Box>
  );
};

export default ErrorDisplay;
