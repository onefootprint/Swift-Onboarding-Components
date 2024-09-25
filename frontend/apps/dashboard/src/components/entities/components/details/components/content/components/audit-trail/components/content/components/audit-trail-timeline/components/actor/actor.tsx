import type { Actor as TActor } from '@onefootprint/types';
import { ActorKind } from '@onefootprint/types';
import { CodeInline, createFontStyles } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type ActorProps = {
  actor: TActor;
};

const Actor = ({ actor }: ActorProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'actor' });

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
  ${({ theme }) => css`
    color: ${theme.color.primary};
  `}
`;

export default Actor;
