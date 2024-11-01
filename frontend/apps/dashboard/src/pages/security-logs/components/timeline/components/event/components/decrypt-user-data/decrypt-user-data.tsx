import { IcoArrowTopRight16 } from '@onefootprint/icons';
import type { DataIdentifier, DecryptUserDataDetail } from '@onefootprint/types';
import { LinkButton, Text, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useDITranslation from 'src/hooks/use-di-translation';
import FirstFieldsText from './components/first-fields';

type DecryptUserDataProps = { detail: DecryptUserDataDetail };

const DecryptUserData = ({ detail }: DecryptUserDataProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.decryption-event' });
  const { decryptedFields, fpId } = detail.data;
  const { translateDI } = useDITranslation();

  if (decryptedFields.length > 3) {
    const numRemainingFields = decryptedFields.length - 3;
    const remainingFieldsTranslated = decryptedFields
      .slice(3)
      .map(field => translateDI(field as DataIdentifier))
      .join('; ');

    return (
      <>
        <Text variant="body-3" color="tertiary" tag="span">
          {t('decrypted')}
        </Text>
        <FirstFieldsText decryptedFields={decryptedFields} />
        <Tooltip text={remainingFieldsTranslated} position="bottom">
          <Text variant="label-3" tag="span" textDecoration="underline" cursor="default">
            {numRemainingFields} {numRemainingFields === 1 ? t('other-attribute') : t('other-attributes')}
          </Text>
        </Tooltip>
        <Text variant="body-3" tag="span" minWidth="fit-content">
          {t('of-a')}
        </Text>
        <LinkButton href={`/users/${fpId}`} iconComponent={IcoArrowTopRight16} target="_blank">
          {t('user')}
        </LinkButton>
      </>
    );
  }

  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {t('decrypted')}
      </Text>
      <FirstFieldsText decryptedFields={decryptedFields} />
      <Text variant="body-3" tag="span">
        {t('of-a')}
      </Text>
      <LinkButton href={`/security-logs/${fpId}`} iconComponent={IcoArrowTopRight16}>
        {t('user')}
      </LinkButton>
    </>
  );
};

export default DecryptUserData;
