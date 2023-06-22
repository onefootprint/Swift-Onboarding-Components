import { useTranslation } from '@onefootprint/hooks';
import { Actor as TActor, ActorKind } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type ActorProps = {
  actor: TActor;
};

const Actor = ({ actor }: ActorProps) => {
  const { t } = useTranslation('pages.entity.actor');

  if (actor.kind === ActorKind.footprint) {
    return <Typography variant="label-3">{t('footprint')}</Typography>;
  }
  if (actor.kind === ActorKind.firmEmployee) {
    return <Typography variant="label-3">{t('firm-employee')}</Typography>;
  }
  // TODO actually deeplink to these resources
  if (actor.kind === ActorKind.organization) {
    return <Typography variant="label-3">{actor.member}</Typography>;
  }
  if (actor.kind === ActorKind.apiKey) {
    return <Typography variant="label-3">{actor.name}</Typography>;
  }
  return null;
};

export default Actor;
