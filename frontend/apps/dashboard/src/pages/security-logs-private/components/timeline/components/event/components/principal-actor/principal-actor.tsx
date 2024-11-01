import type { AccessEvent, Actor } from '@onefootprint/types';
import { ActorKind } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import InsightEventDisplay from './components/insight-event-display';

type PrincipalActorProps = {
  principal: Actor;
  insightEvent: AccessEvent['insightEvent'];
};

const PrincipalActor = ({ principal, insightEvent }: PrincipalActorProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'principal-actor' });

  return (
    <Container>
      <Stack gap={2}>
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
      <InsightEventWrapper>
        <InsightEventDisplay insightEvent={insightEvent} />
      </InsightEventWrapper>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  cursor: default;
`;

const InsightEventWrapper = styled.div`
    display: none;
    position: absolute;
    z-index: 1;
    left: 0;
    top: 100%;

    ${Container}:hover & {
      display: block;
    }
`;

export default PrincipalActor;
