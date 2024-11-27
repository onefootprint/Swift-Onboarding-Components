import { IcoArrowTopRight16 } from '@onefootprint/icons';
import type { AuditEventDetail } from '@onefootprint/request-types/dashboard';
import { LinkButton, Text } from '@onefootprint/ui';
import capitalize from 'lodash/capitalize';
import { useTranslation } from 'react-i18next';

type EditPlaybookProps = { detail: AuditEventDetail; hasPrincipalActor: boolean };

const EditPlaybook = ({ detail, hasPrincipalActor }: EditPlaybookProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.playbooks' });
  if (detail.kind !== 'edit_playbook') return null;

  const {
    playbook: { playbookId },
  } = detail.data;

  return (
    <>
      <Text variant="body-3" color="tertiary" tag="span">
        {hasPrincipalActor ? t('edited-a') : capitalize(t('edited-a'))}
      </Text>
      <LinkButton href={`/playbooks/${playbookId}`} target="_blank" iconComponent={IcoArrowTopRight16}>
        {t('playbook')}
      </LinkButton>
    </>
  );
};

export default EditPlaybook;
