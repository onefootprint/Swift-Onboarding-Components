import { IcoArrowTopRight16 } from '@onefootprint/icons';
import type { AuditEventDetail, DataIdentifier } from '@onefootprint/request-types/dashboard';
import { LinkButton, Text, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import FirstFieldsText from './components/first-fields';
import { MAX_VISIBLE_FIELDS } from './constants';

type UserDataProps = {
  detail: AuditEventDetail;
};

const UserData = ({ detail }: UserDataProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.user-data' });
  const { t: allT } = useTranslation('common', { keyPrefix: 'di' });

  let fields = [];
  let actionText = '';

  if (detail.kind === 'decrypt_user_data') {
    fields = detail.data.decryptedFields;
    actionText = t('decrypted');
  } else if (detail.kind === 'delete_user_data') {
    fields = detail.data.deletedFields;
    actionText = t('deleted');
  } else if (detail.kind === 'update_user_data') {
    fields = detail.data.updatedFields;
    actionText = t('updated');
  } else {
    return null;
  }

  const fpId = detail.data.fpId;
  const showTooltip = fields.length > MAX_VISIBLE_FIELDS;
  const numRemainingFields = fields.length - MAX_VISIBLE_FIELDS;
  const remainingFieldsTranslated = showTooltip
    ? fields
        .slice(MAX_VISIBLE_FIELDS)
        .map(field => allT(field as DataIdentifier))
        .join('; ')
    : '';

  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {actionText}
      </Text>
      <FirstFieldsText fields={fields} />
      {showTooltip && (
        <Tooltip text={remainingFieldsTranslated} position="bottom">
          <Text variant="label-3" tag="span" textDecoration="underline" cursor="default">
            {numRemainingFields} {numRemainingFields === 1 ? t('other-attribute') : t('other-attributes')}
          </Text>
        </Tooltip>
      )}
      <Text variant="body-3" tag="span" minWidth={showTooltip ? 'fit-content' : undefined}>
        {t('of-a')}
      </Text>
      <LinkButton href={`/users/${fpId}`} iconComponent={IcoArrowTopRight16} target="_blank">
        {t('user')}
      </LinkButton>
    </>
  );
};

export default UserData;
