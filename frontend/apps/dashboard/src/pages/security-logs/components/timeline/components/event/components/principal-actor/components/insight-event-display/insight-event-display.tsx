import { IcoSparkles16 } from '@onefootprint/icons';
import type { InsightEvent } from '@onefootprint/request-types/dashboard';
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
      gap={5}
      backgroundColor="primary"
      aria-label={t('aria-label')}
      borderColor="tertiary"
      borderStyle="solid"
      borderWidth={1}
      borderRadius="default"
    >
      <Stack gap={1}>
        <IcoSparkles16 />
        <Text variant="label-3">{t('title')}</Text>
      </Stack>
      <Stack justifyContent="space-between" width="420px">
        <Stack direction="column" gap={5}>
          <Stack direction="column" gap={2}>
            <Text variant="body-3" color="tertiary">
              {t('labels.region')}
            </Text>
            <Text variant="body-3">{insightEvent?.region || '-'}</Text>
          </Stack>

          <Stack direction="column" gap={2}>
            <Text variant="body-3" color="tertiary">
              {t('labels.country')}
            </Text>
            <Text variant="body-3">{insightEvent?.country || '-'}</Text>
          </Stack>

          <Stack direction="column" gap={2}>
            <Text variant="body-3" color="tertiary">
              {t('labels.postal-code')}
            </Text>
            <Text variant="body-3">{insightEvent?.postalCode || '-'}</Text>
          </Stack>
        </Stack>
        <Stack direction="column" gap={5} width="221px">
          <Stack direction="column" gap={2}>
            <Text variant="body-3" color="tertiary">
              {t('labels.ip-address')}
            </Text>
            <Text variant="body-3">{insightEvent?.ipAddress || '-'}</Text>
          </Stack>

          <Stack direction="column" gap={2}>
            <Text variant="body-3" color="tertiary">
              {t('labels.user-agent')}
            </Text>
            <Text variant="body-3">{insightEvent?.userAgent || '-'}</Text>
          </Stack>
        </Stack>
      </Stack>
    </ShadowStack>
  );
};

const ShadowStack = styled(Stack)`
    box-shadow: 0px 1px 8px 0px #00000024;
`;

export default InsightEventDisplay;
