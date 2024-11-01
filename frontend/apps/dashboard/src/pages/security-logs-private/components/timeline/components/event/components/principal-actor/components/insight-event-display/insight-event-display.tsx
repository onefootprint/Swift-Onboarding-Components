import type { InsightEvent } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type InsightEventDisplayProps = {
  insightEvent?: InsightEvent;
};

const InsightEventDisplay = ({ insightEvent }: InsightEventDisplayProps) => {
  const { t } = useTranslation('security-logs', {
    keyPrefix: 'principal-actor.insight-event',
  });

  return (
    <ShadowStack
      direction="column"
      paddingInline={5}
      paddingBlock={4}
      gap={6}
      backgroundColor="primary"
      aria-label={t('aria-label')}
      borderColor="tertiary"
      borderStyle="solid"
      borderWidth={1}
      borderRadius="default"
    >
      <Text variant="label-3">{t('title')}</Text>
      <Stack justifyContent="space-between" width="443px">
        <Stack direction="column" gap={3}>
          <Text variant="body-3" color="tertiary">
            {t('labels.region')}
          </Text>
          <Text variant="body-3" color="tertiary">
            {t('labels.country')}
          </Text>
          <Text variant="body-3" color="tertiary">
            {t('labels.postal-code')}
          </Text>
          <Text variant="body-3" color="tertiary">
            {t('labels.ip-address')}
          </Text>
          <Text variant="body-3" color="tertiary">
            {t('labels.user-agent')}
          </Text>
        </Stack>
        <Stack direction="column" gap={3} width="221px">
          <Text variant="body-3">{insightEvent?.region || '-'}</Text>
          <Text variant="body-3">{insightEvent?.country || '-'}</Text>
          <Text variant="body-3">{insightEvent?.postalCode || '-'}</Text>
          <Text variant="body-3">{insightEvent?.ipAddress || '-'}</Text>
          <Text variant="body-3" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            {insightEvent?.userAgent || '-'}
          </Text>
        </Stack>
      </Stack>
    </ShadowStack>
  );
};

const ShadowStack = styled(Stack)`
    box-shadow: 0px 1px 8px 0px #00000024;
`;

export default InsightEventDisplay;
