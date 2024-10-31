import type { AccessEvent } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type DecryptionReasonProps = {
  detail: AccessEvent['detail'];
};

const DecryptionReason = ({ detail }: DecryptionReasonProps) => {
  const { t } = useTranslation('security-logs', {
    keyPrefix: 'events.body.decryption-reason',
  });
  return (
    <Stack gap={2} aria-label={t('aria-label')}>
      <Text variant="body-3">{detail.data.reason}</Text>
    </Stack>
  );
};

export default DecryptionReason;
