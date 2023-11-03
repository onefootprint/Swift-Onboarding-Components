import { useTranslation } from '@onefootprint/hooks';
import { CodeInline, Stack, Typography } from '@onefootprint/ui';
import React from 'react';

export type IdProps = {
  value: string;
};

const Id = ({ value }: IdProps) => {
  const { t } = useTranslation('pages.settings.business-profile.id');

  return (
    <Stack direction="column" gap={3} justify="center">
      <Typography variant="label-3" color="tertiary">
        {t('label')}
      </Typography>
      <CodeInline>{value}</CodeInline>
    </Stack>
  );
};

export default Id;
