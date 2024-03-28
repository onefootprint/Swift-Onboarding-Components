import { Stack, Text } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useListDetails from '../../../../hooks/use-list-details';
import SectionTitle from '../section-title';

const ActivityLog = () => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.activity-log',
  });
  const router = useRouter();
  const id = router.query.id as string;
  const { isLoading, error, data } = useListDetails(id);
  if (isLoading || error || !data) {
    return null;
  }

  return (
    <Stack gap={4} direction="column">
      <SectionTitle title={t('title', { alias: data.alias })} />
      {/* TODO: implement */}
      <Text variant="body-3" color="tertiary">
        {t('empty')}
      </Text>
    </Stack>
  );
};

export default ActivityLog;
