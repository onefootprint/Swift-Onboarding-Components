import type { Actor, AuditEvent } from '@onefootprint/request-types/dashboard';
import { Stack, Text } from '@onefootprint/ui';
import * as HoverCard from '@radix-ui/react-hover-card';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import InsightEventDisplay from './components/insight-event-display';

type PrincipalActorProps = {
  principal: Actor;
  insightEvent: AuditEvent['insightEvent'];
};

const PrincipalActor = ({ principal, insightEvent }: PrincipalActorProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'principal-actor' });

  return (
    <HoverCard.Root openDelay={0} closeDelay={0}>
      <Stack gap={2} cursor="default">
        <HoverCard.Trigger asChild>
          <Text variant="label-3" textDecoration="underline">
            {principal.kind === 'footprint' && t('footprint')}
            {principal.kind === 'firm_employee' && t('firm-employee')}
            {principal.kind === 'organization' &&
              (principal?.firstName || principal?.lastName
                ? `${principal?.firstName ?? ''} ${principal?.lastName ?? ''}`
                : t('employees'))}
            {principal.kind === 'api_key' && `${t('api-key')}`}
            {principal.kind === 'user' && t('user')}
          </Text>
        </HoverCard.Trigger>
        {principal.kind === 'organization' && <Text variant="body-3">({principal.email})</Text>}
        {principal.kind === 'api_key' && <Text variant="body-3">({principal.name})</Text>}
      </Stack>

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
