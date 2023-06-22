import { useTranslation } from '@onefootprint/hooks';
import { Actor as TActor, ActorKind } from '@onefootprint/types';
import { createFontStyles } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

type ActorProps = {
  actor: TActor;
};

const Actor = ({ actor }: ActorProps) => {
  const { t } = useTranslation('pages.entity.actor');

  return (
    <Container>
      {actor.kind === ActorKind.footprint && t('footprint')}
      {actor.kind === ActorKind.firmEmployee && t('firm-employee')}
      {/* TODO deeplink these one day */}
      {actor.kind === ActorKind.organization && actor.member}
      {actor.kind === ActorKind.apiKey && actor.name}
    </Container>
  );
};

const Container = styled.span`
  ${createFontStyles('label-3')};
  color: currentColor;
`;

export default Actor;
