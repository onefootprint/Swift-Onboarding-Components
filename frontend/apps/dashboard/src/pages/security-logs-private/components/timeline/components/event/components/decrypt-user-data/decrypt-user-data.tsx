import { IcoArrowTopRight16 } from '@onefootprint/icons';
import type { AccessEvent } from '@onefootprint/types';
import { LinkButton, Stack, Text, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import FirstFieldsText from './components/first-fields';

type DecryptUserDataProps = {
  detail: AccessEvent['detail'];
};

const DecryptUserData = ({ detail }: DecryptUserDataProps) => {
  const { t } = useTranslation('security-logs', {
    keyPrefix: 'events.decryption-event',
  });
  const { t: allT } = useTranslation('common');
  const {
    data: { decryptedFields },
  } = detail;

  if (decryptedFields.length > 3) {
    const numRemainingFields = decryptedFields.length - 3;
    const remainingFieldsTranslated = decryptedFields
      .slice(3)
      .map(field => allT(`di.${field}`))
      .join('; ');

    return (
      <Stack gap={2} aria-label={t('aria-label')}>
        <Text variant="body-3" color="tertiary" tag="span">
          {t('decrypted')}
        </Text>
        <FirstFieldsText decryptedFields={decryptedFields} />
        <Tooltip text={remainingFieldsTranslated} position="top">
          <Text variant="label-3" tag="span" textDecoration="underline">
            {numRemainingFields} {numRemainingFields === 1 ? t('other-attribute') : t('other-attributes')}
          </Text>
        </Tooltip>
        <Text variant="body-3" tag="span">
          {t('of-a')}
        </Text>
        <LinkButton href={`/security-logs/${detail.data.fpId}`} iconComponent={IcoArrowTopRight16}>
          {t('user')}
        </LinkButton>
      </Stack>
    );
  }

  return (
    <Stack gap={2} aria-label={t('aria-label')}>
      <Text variant="body-3" color="tertiary" tag="span">
        {t('decrypted')}
      </Text>
      <FirstFieldsText decryptedFields={decryptedFields} />
      <Text variant="body-3" tag="span">
        {t('of-a')}
      </Text>
      <LinkButton href={`/security-logs/${detail.data.fpId}`} iconComponent={IcoArrowTopRight16}>
        {t('user')}
      </LinkButton>
    </Stack>
  );
};

export default DecryptUserData;
