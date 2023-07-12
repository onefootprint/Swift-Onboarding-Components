import { RoleScopeKind } from '@onefootprint/types';
import { Box, Tooltip } from '@onefootprint/ui';
import React from 'react';
import usePermissions from 'src/hooks/use-permissions';

export type PermissionGateProps = {
  children: JSX.Element;
  scopeKind: Exclude<RoleScopeKind, RoleScopeKind.decrypt>;
  fallbackText: string;
};

const PermissionGate = ({
  children,
  scopeKind,
  fallbackText,
}: PermissionGateProps) => {
  const { hasPermission } = usePermissions();

  return hasPermission(scopeKind) ? (
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
