import type { AuditEventDetail } from '@onefootprint/request-types/dashboard';
import { Stack, Text } from '@onefootprint/ui';
import * as HoverCard from '@radix-ui/react-hover-card';
import styled, { keyframes } from 'styled-components';
import RoleDiff from './role-diff';

type UpdatedRoleProps = {
  detail: AuditEventDetail;
};

const UpdatedRole = ({ detail }: UpdatedRoleProps) => {
  if (detail.kind !== 'update_org_role') return null;

  return (
    <HoverCard.Root openDelay={0} closeDelay={0}>
      <Stack gap={2} cursor="default">
        <HoverCard.Trigger asChild>
          <Text variant="label-3" textDecoration="underline">
            {detail.data.roleName}
          </Text>
        </HoverCard.Trigger>
      </Stack>

      <HoverCard.Portal>
        <HoverCardContent side="bottom" sideOffset={5} align="start">
          <RoleDiff detail={detail} />
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

export default UpdatedRole;
