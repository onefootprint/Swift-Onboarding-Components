import styled from '@onefootprint/styled';
import type { Actor as TActor } from '@onefootprint/types';
import { ActorKind } from '@onefootprint/types';
import { CodeInline, createFontStyles } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type ActorProps = {
  actor: TActor;
};

const Actor = ({ actor }: ActorProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.actor' });

  return (
    <Container>
      {actor.kind === ActorKind.user && (
        <span>
          <CodeInline isPrivate>{actor.fpId}</CodeInline>
        </span>
      )}
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
