import type { TenantScope } from '@onefootprint/request-types/dashboard';
import { Text } from '@onefootprint/ui';
import * as HoverCard from '@radix-ui/react-hover-card';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import ApiKeyDetails from './components/api-key-details';

const ApiKeyDisplay = ({ name, scopes, roleName }: { name: string; scopes: TenantScope[]; roleName: string }) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.api-keys' });

  return (
    <HoverCard.Root openDelay={0} closeDelay={0}>
      <HoverCard.Trigger asChild>
        <Text variant="label-3" textDecoration="underline">
          {t('api-key')} ({name})
        </Text>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCardContent side="bottom" sideOffset={5} align="start">
          <ApiKeyDetails name={name} scopes={scopes} roleName={roleName} />
        </HoverCardContent>
      </HoverCard.Portal>
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

export default ApiKeyDisplay;
