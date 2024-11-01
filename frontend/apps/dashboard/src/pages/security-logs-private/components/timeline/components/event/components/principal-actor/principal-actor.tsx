import type { AccessEvent, Actor } from '@onefootprint/types';
import { ActorKind } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import * as HoverCard from '@radix-ui/react-hover-card';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import InsightEventDisplay from './components/insight-event-display';

type PrincipalActorProps = {
  principal: Actor;
  insightEvent: AccessEvent['insightEvent'];
};

const PrincipalActor = ({ principal, insightEvent }: PrincipalActorProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'principal-actor' });

  return (
    <HoverCard.Root openDelay={0} closeDelay={0}>
      <HoverCard.Trigger asChild>
        <Stack gap={2} cursor="default">
          <Text variant="label-3" textDecoration="underline">
            {principal.kind === ActorKind.footprint && t('footprint')}
            {principal.kind === ActorKind.firmEmployee && t('firm-employee')}
            {principal.kind === ActorKind.organization &&
              (principal?.firstName || principal?.lastName
                ? `${principal?.firstName ?? ''} ${principal?.lastName ?? ''}`
                : t('employees'))}
            {principal.kind === ActorKind.apiKey && `${t('api-key')}`}
            {principal.kind === ActorKind.user && t('user')}
          </Text>
          {principal.kind === ActorKind.organization && <Text variant="body-3">({principal.email})</Text>}
          {principal.kind === ActorKind.apiKey && <Text variant="body-3">({principal.name})</Text>}
        </Stack>
      </HoverCard.Trigger>
      {insightEvent && (
        <HoverCard.Portal>
          <HoverCardContent side="bottom" sideOffset={5} align="start">
            <InsightEventDisplay insightEvent={insightEvent} />
          </HoverCardContent>
        </HoverCard.Portal>
      )}
    </HoverCard.Root>
  );
};

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const HoverCardContent = styled(HoverCard.Content)`
    will-change: opacity;
    transform-origin: var(--radix-hover-card-content-transform-origin);
    animation: ${scaleIn} 0.1s ease-out;
`;

export default PrincipalActor;
