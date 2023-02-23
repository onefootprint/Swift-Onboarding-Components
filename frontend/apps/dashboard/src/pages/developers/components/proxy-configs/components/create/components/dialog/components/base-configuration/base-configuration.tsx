import { useTranslation } from '@onefootprint/hooks';
import { Box, Select, TextInput, Typography } from '@onefootprint/ui';
import React from 'react';

const BaseConfiguration = () => {
  const { t } = useTranslation(
    'pages.proxy-configs.create.form.basic-configuration',
  );

  return (
    <Box>
      <Typography variant="label-2" sx={{ marginBottom: 5 }}>
        {t('title')}
      </Typography>
      <Box sx={{ display: 'grid', gap: 5 }}>
        <TextInput label={t('url.label')} placeholder={t('url.placeholder')} />
        <Select
          label={t('method.label')}
          options={[
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'PUT', value: 'PUT' },
            { label: 'DELETE', value: 'DELETE' },
            { label: 'PATCH', value: 'PATCH' },
          ]}
        />
        <TextInput
          label={t('access-reason.label')}
          placeholder={t('access-reason.placeholder')}
        />
      </Box>
    </Box>
  );
};

export default BaseConfiguration;
