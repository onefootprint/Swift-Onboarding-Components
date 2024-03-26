import { Stack, Text } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useList from '../../../../hooks/use-list';
import SectionTitle from '../section-title';

const ActivityLog = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.lists.details.activity-log',
  });
  const router = useRouter();
  const id = router.query.id as string;
  const { isLoading, error, data } = useList(id);
  if (isLoading || error || !data) {
    return null;
  }

  return (
    <Stack gap={4} direction="column">
      <SectionTitle title={t('title', { alias: data.alias })} />
      {/* TODO: implement */}
      {!data.entriesCount && (
        <Text variant="body-3" color="tertiary">
          {t('empty')}
        </Text>
      )}
    </Stack>
  );
};

export default ActivityLog;
