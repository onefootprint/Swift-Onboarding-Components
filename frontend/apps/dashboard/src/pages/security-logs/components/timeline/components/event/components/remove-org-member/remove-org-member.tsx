import type { AuditEventDetail } from '@onefootprint/request-types/dashboard';
import { Text } from '@onefootprint/ui';
import capitalize from 'lodash/capitalize';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';

type RemoveOrgMemberProps = { detail: AuditEventDetail; hasPrincipalActor: boolean };

const RemoveOrgMember = ({ detail, hasPrincipalActor }: RemoveOrgMemberProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.remove' });
  const {
    data: { org },
  } = useSession();
  if (detail.kind !== 'remove_org_member') {
    return null;
  }
  const { firstName, lastName } = detail.data.member;

  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {hasPrincipalActor ? t('removed') : capitalize(t('removed'))}
      </Text>
      <Text variant="label-3" tag="span">
        {firstName && lastName ? `${firstName} ${lastName}` : t('a-member')}
      </Text>
      <Text variant="body-3" tag="span">
        {` ${t('from')} `}
      </Text>
      <Text variant="label-3" tag="span">
        {` ${org?.name} ${t('team')}`}
      </Text>
    </>
  );
};

export default RemoveOrgMember;
