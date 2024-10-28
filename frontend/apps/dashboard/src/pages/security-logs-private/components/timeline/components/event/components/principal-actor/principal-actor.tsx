import type { AccessEvent } from '@onefootprint/types';
import { LinkButton } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import InsightEvent from './components/insight-event';

type PrincipalActorProps = {
  principal: AccessEvent['principal'];
};

const PrincipalActor = ({ principal }: PrincipalActorProps) => {
  const { t } = useTranslation('security-logs');

  return (
    <Container>
      <LinkButton href={`/users/${principal.id}`}>{principal.name ?? t('principal-actor.a-user')}</LinkButton>
      <InsightEventWrapper>
        <InsightEvent />
      </InsightEventWrapper>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
`;

const InsightEventWrapper = styled.div`
    display: none;
    position: absolute;
    z-index: 1;
    top: 100%;
    left: 0;

    ${Container}:hover & {
      display: block;
    }
`;

export default PrincipalActor;
