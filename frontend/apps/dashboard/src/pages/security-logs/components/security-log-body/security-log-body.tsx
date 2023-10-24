import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { AccessEvent } from '@onefootprint/types';
import { Box, CodeInline, Grid, Stack, Typography } from '@onefootprint/ui';
import React from 'react';
import getRegionForInsightEvent from 'src/utils/insight-event-region';
import { displayForUserAgent } from 'src/utils/user-agent';

type SecurityLogBodyProps = {
  accessEvent: AccessEvent;
};

const SecurityLogBody = ({ accessEvent }: SecurityLogBodyProps) => {
  const { t } = useTranslation('pages.security-logs.body');
  return (
    <AccessEventBodyContainer direction="column" gap={9}>
      <Stack direction="column" gap={5}>
        <Typography variant="label-4">{t('user')}</Typography>
        <Grid.Container columns={['repeat(4, minmax(0, 1fr))']}>
          <Typography variant="body-4" color="tertiary">
            {t('footprint-token')}
          </Typography>
          <Grid.Item column="2 / span 3">
            <CodeInline size="compact" isPrivate>
              {accessEvent.fpId}
            </CodeInline>
          </Grid.Item>
        </Grid.Container>
      </Stack>
      {accessEvent.insightEvent && (
        <Stack direction="column" gap={5}>
          <Typography variant="label-4">{t('metadata')}</Typography>
          <Grid.Container columns={['repeat(4, minmax(0, 1fr))']} rowGap={2}>
            <Typography variant="body-4" color="tertiary">
              {t('region')}
            </Typography>
            <Typography variant="body-4" isPrivate>
              {getRegionForInsightEvent(accessEvent.insightEvent) || '-'}
            </Typography>
            <Typography variant="body-4" color="tertiary">
              {t('ip-address')}
            </Typography>
            <Typography variant="body-4" isPrivate>
              {accessEvent.insightEvent.ipAddress || '-'}
            </Typography>
            <Typography variant="body-4" color="tertiary">
              {t('country')}
            </Typography>
            <Typography variant="body-4" isPrivate>
              {accessEvent.insightEvent.country || '-'}
            </Typography>
            <Typography variant="body-4" color="tertiary">
              {t('device-os')}
            </Typography>
            <Box
              overflow="hidden"
              sx={{
                gridArea: '2 / 4 / span 2 / span 1',
              }}
            >
              <Typography
                variant="body-4"
                sx={{ overflow: 'hidden' }}
                isPrivate
              >
                {displayForUserAgent(accessEvent.insightEvent.userAgent || '')}
              </Typography>
            </Box>
            <Typography variant="body-4" color="tertiary">
              Zip code
            </Typography>
            <Typography variant="body-4" isPrivate>
              {accessEvent.insightEvent.postalCode || '-'}
            </Typography>
          </Grid.Container>
        </Stack>
      )}
      <Stack direction="column" gap={5}>
        <Typography variant="label-4">Reason</Typography>
        <Typography variant="body-4" color="secondary">
          {accessEvent.reason || '-'}
        </Typography>
      </Stack>
    </AccessEventBodyContainer>
  );
};

const AccessEventBodyContainer = styled(Stack)`
  ${({ theme }) => css`
    margin: ${theme.spacing[5]} 0 ${theme.spacing[9]}
      calc(-1 * ${theme.spacing[3]});
  `};
`;

export default SecurityLogBody;
