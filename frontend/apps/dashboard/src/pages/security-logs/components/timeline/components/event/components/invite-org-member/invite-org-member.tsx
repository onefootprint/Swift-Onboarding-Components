import type { AuditEventDetail } from '@onefootprint/request-types/dashboard';
import { Text } from '@onefootprint/ui';
import capitalize from 'lodash/capitalize';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';

type InviteOrgMemberProps = { detail: AuditEventDetail; hasPrincipalActor: boolean };

const InviteOrgMember = ({ detail, hasPrincipalActor }: InviteOrgMemberProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.invite' });
  const {
    data: { org },
  } = useSession();
  if (detail.kind !== 'invite_org_member') {
    return null;
  }
  const { firstName, lastName } = detail.data;

  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {hasPrincipalActor ? t('invited') : capitalize(t('invited'))}
      </Text>
      <Text variant="label-3" tag="span">
        {firstName && lastName ? `${firstName} ${lastName}` : 'a member'}
      </Text>
      <Text variant="body-3" color="tertiary" tag="span">
        {t('to-join')}
      </Text>
      <Text variant="label-3" tag="span">
        {org?.name}
      </Text>
    </>
  );
};

export default InviteOrgMember;
