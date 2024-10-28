import type { AccessEvent } from '@onefootprint/types';
import { LinkButton } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type PrincipalActorProps = {
  principal: AccessEvent['principal'];
};

const PrincipalActor = ({ principal }: PrincipalActorProps) => {
  const { t } = useTranslation('security-logs');
  return <LinkButton href={`/users/${principal.id}`}>{principal.name ?? t('principal-actor.a-user')}</LinkButton>;
};

export default PrincipalActor;
