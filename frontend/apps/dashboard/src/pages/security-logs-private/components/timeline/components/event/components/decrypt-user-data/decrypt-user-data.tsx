import type { AccessEvent } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type DecryptUserDataProps = {
  detail: AccessEvent['detail'];
};

const DecryptUserData = ({ detail }: DecryptUserDataProps) => {
  const { t } = useTranslation('security-logs', {
    keyPrefix: 'events.decryption-event',
  });

  return (
    <Text variant="body-3" color="tertiary" aria-label={t('aria-label')}>
      {t('decrypted')} <a href={`/security-logs/${detail.data.fpId}`}>{t('a-user')}</a>
    </Text>
  );
};

export default DecryptUserData;
