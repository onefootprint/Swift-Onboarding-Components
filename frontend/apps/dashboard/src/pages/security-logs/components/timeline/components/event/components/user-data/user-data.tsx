import { IcoArrowTopRight16 } from '@onefootprint/icons';
import type { AuditEventDetail } from '@onefootprint/request-types/dashboard';
import { LinkButton, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import FieldList from './components/field-list';

type UserDataProps = {
  detail: AuditEventDetail;
};

const UserData = ({ detail }: UserDataProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.user-data' });

  let actionText = '';

  let fields = [];
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

  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {actionText}
      </Text>
      <FieldList fields={fields} />
      <Text variant="body-3" tag="span">
        {t('of-a')}
      </Text>
      <LinkButton href={`/users/${fpId}`} iconComponent={IcoArrowTopRight16} target="_blank">
        {t('user')}
      </LinkButton>
    </>
  );
};

export default UserData;
