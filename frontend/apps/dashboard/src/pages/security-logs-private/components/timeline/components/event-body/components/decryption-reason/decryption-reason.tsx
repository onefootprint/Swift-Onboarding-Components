import { IcoInfo16 } from '@onefootprint/icons';
import type { DecryptUserDataDetail } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type DecryptionReasonProps = {
  detail: DecryptUserDataDetail;
};

const DecryptionReason = ({ detail }: DecryptionReasonProps) => {
  const { t } = useTranslation('security-logs', {
    keyPrefix: 'events.body.decryption-reason',
  });
  const { reason } = detail.data;

  return (
    <Stack
      aria-label={t('aria-label')}
      width="100%"
      borderRadius="default"
      borderColor="tertiary"
      borderWidth={1}
      borderStyle="solid"
      padding={5}
      gap={3}
      direction="column"
      marginBottom={8}
    >
      <Stack gap={1} alignItems="center">
        <IcoInfo16 />
        <Text variant="label-3">{t('decryption-reason')}</Text>
      </Stack>
      <Text variant="body-3">{reason}</Text>
    </Stack>
  );
};

export default DecryptionReason;
