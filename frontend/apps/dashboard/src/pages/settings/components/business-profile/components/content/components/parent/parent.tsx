import type { ParentOrganization } from '@onefootprint/types/src/data/organization';
import { CodeInline, Grid, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type ParentProps = {
  org: ParentOrganization;
};

const Parent = ({ org }: ParentProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile.parent',
  });

  return (
    <Grid.Container columns={['repeat(4 , 1fr)']}>
      <Stack direction="column" gap={3} justify="start">
        <Text variant="label-3" color="tertiary">
          {t('name')}
        </Text>
        <Text variant="label-3" color="primary">
          {org.name}
        </Text>
      </Stack>
      <Stack direction="column" gap={3} justify="start">
        <Text variant="label-3" color="tertiary">
          {t('id')}
        </Text>
        <CodeInline>{org.id}</CodeInline>
      </Stack>
    </Grid.Container>
  );
};

export default Parent;
