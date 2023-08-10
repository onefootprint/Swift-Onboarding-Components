import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

type ErrorsProps = {
  errors: string[];
};

const Errors = ({ errors }: ErrorsProps) => {
  const { t } = useTranslation('components.scan.preview.errors');

  return (
    <Box gap={3} center marginTop={7}>
      <Typography variant="label-1" color="error">
        {t('title')}
      </Typography>
      <Typography variant="body-2" color="secondary" center>
        {errors.join(' ')}
      </Typography>
    </Box>
  );
};

export default Errors;
