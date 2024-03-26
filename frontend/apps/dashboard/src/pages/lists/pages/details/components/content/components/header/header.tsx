import { Button, Stack, Text } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useList from '@/lists/pages/details/hooks/use-list';

const Header = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { isLoading, error, data } = useList(id);
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.lists.details.header',
  });

  if (isLoading || error || !data) {
    return null;
  }

  return (
    <Stack
      aria-label={data.name}
      direction="row"
      justifyContent="space-between"
    >
      <Stack display="flex" direction="column">
        <Stack gap={3}>
          <Text variant="label-1">{data.name}</Text>
          <Text tag="span" variant="label-1">
            •
          </Text>
          <Text variant="label-1" color="tertiary">
            {data.alias}
          </Text>
        </Stack>
        <Stack align="center" gap={2}>
          <Text variant="body-4" color="secondary">
            {t('kind')}
          </Text>
          <Text variant="label-4" color="secondary">
            {data.kind}
          </Text>
        </Stack>
      </Stack>
      <Stack align="center" gap={3}>
        <Button variant="secondary">{t('edit')}</Button>
      </Stack>
    </Stack>
  );
};

export default Header;
