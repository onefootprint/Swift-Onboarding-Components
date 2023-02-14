import { RoleScope } from '@onefootprint/types';
import { Box, Tooltip } from '@onefootprint/ui';
import React from 'react';
import usePermissions from 'src/hooks/use-permissions';

export type PermissionGateProps = {
  children: JSX.Element;
  scope: RoleScope;
  fallbackText: string;
};

const PermissionGate = ({
  children,
  scope,
  fallbackText,
}: PermissionGateProps) => {
  const { hasPermission } = usePermissions();

  return hasPermission(scope) ? (
    children
  ) : (
    <Tooltip text={fallbackText}>
      <Box>
        {React.cloneElement(children, {
          disabled: true,
        })}
      </Box>
    </Tooltip>
  );
};

export default PermissionGate;

export { RoleScope as Scope };
