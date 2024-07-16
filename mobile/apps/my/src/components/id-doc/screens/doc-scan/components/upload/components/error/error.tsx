import { IcoForbid40 } from '@onefootprint/icons';
import { Box, Button, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

type ErrorProps = {
  onReset: () => void;
  errors: string[];
};

const ErrorComponent = ({ errors, onReset }: ErrorProps) => {
  const { t } = useTranslation('scan.upload.errors');

  return (
    <Box justifyContent="space-between" flex={1} width="100%">
      <Box />
      <Box center>
        <Box marginBottom={7}>
          <IcoForbid40 color="error" />
        </Box>
        <Box gap={3} center>
          <Typography variant="label-1" color="error">
            {t('title')}
          </Typography>
          {errors.map(e => {
            return (
              <Typography key={e} variant="body-2" color="secondary" center>
                • {e}
              </Typography>
            );
          })}
        </Box>
      </Box>
      <Button onPress={onReset}>{t('cta')}</Button>
    </Box>
  );
};

export default ErrorComponent;
