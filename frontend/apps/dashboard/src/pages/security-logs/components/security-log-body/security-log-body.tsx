import type { AccessEvent } from '@onefootprint/types';
import { Box, CodeInline, Grid, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import getRegionForInsightEvent from 'src/utils/insight-event-region';
import { displayForUserAgent } from 'src/utils/user-agent';

type SecurityLogBodyProps = {
  accessEvent: AccessEvent;
};

const SecurityLogBody = ({ accessEvent }: SecurityLogBodyProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.security-logs.body',
  });
  const { insightEvent } = accessEvent;
  const { fpId, reason } = accessEvent.detail.data;

  return (
    <Stack direction="column" gap={9}>
      <Stack direction="column" gap={5}>
        <Text variant="label-4">{t('user')}</Text>
        <Grid.Container columns={['repeat(4, minmax(0, 1fr))']}>
          <Text variant="body-4" color="tertiary">
            {t('footprint-token')}
          </Text>
          <Grid.Item column="2 / span 3">
            <CodeInline size="compact" isPrivate>
              {fpId}
            </CodeInline>
          </Grid.Item>
        </Grid.Container>
      </Stack>
      {insightEvent && (
        <Stack direction="column" gap={5}>
          <Text variant="label-4">{t('metadata')}</Text>
          <Grid.Container columns={['repeat(4, minmax(0, 1fr))']} gap={2}>
            <Text variant="body-4" color="tertiary">
              {t('region')}
            </Text>
            <Text variant="body-4" isPrivate>
              {getRegionForInsightEvent(insightEvent) || '-'}
            </Text>
            <Text variant="body-4" color="tertiary">
              {t('ip-address')}
            </Text>
            <Text variant="body-4" isPrivate>
              {insightEvent.ipAddress || '-'}
            </Text>
            <Text variant="body-4" color="tertiary">
              {t('country')}
            </Text>
            <Text variant="body-4" isPrivate>
              {insightEvent.country || '-'}
            </Text>
            <Text variant="body-4" color="tertiary">
              {t('device-os')}
            </Text>
            <Box overflow="hidden" gridArea="2 / 4 / span 2 / span 1">
              <Text variant="body-4" overflow="hidden" isPrivate>
                {displayForUserAgent(insightEvent.userAgent || '')}
              </Text>
            </Box>
            <Text variant="body-4" color="tertiary">
              Zip code
            </Text>
            <Text variant="body-4" isPrivate>
              {insightEvent.postalCode || '-'}
            </Text>
          </Grid.Container>
        </Stack>
      )}
      <Stack direction="column" gap={5}>
        <Text variant="label-4">Reason</Text>
        <Text variant="body-4" color="secondary">
          {reason || '-'}
        </Text>
      </Stack>
    </Stack>
  );
};

export default SecurityLogBody;
