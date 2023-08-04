import { useTranslation } from '@onefootprint/hooks';
import { Box, Shimmer, Typography } from '@onefootprint/ui';
import times from 'lodash/times';
import React from 'react';

import ButtonGroup from '../button-group';

const Loading = () => {
  const { t } = useTranslation('pages.organizations');

  return (
    <Box testID="organizations-loading" sx={{ width: '100%' }}>
      <Typography
        variant="label-1"
        color="primary"
        sx={{ marginTop: 8, marginBottom: 3, textAlign: 'center' }}
      >
        {t('title')}
      </Typography>
      <ButtonGroup isLoading>
        {times(3).map(value => (
          <button type="button" key={value}>
            <Shimmer aria-hidden sx={{ height: '24px', width: '100%' }} />
          </button>
        ))}
      </ButtonGroup>
    </Box>
  );
};

export default Loading;
