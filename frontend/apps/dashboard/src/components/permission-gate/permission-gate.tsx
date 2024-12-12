import type { TenantScope } from '@onefootprint/request-types/dashboard';
import { Tooltip } from '@onefootprint/ui';
import React from 'react';
import usePermissions from 'src/hooks/use-permissions';

export type PermissionGateProps = {
  children: JSX.Element;
  scopeKind: Exclude<TenantScope, 'decrypt_all'>['kind'];
  fallbackText: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
};

const PermissionGate = ({ children, scopeKind, fallbackText, tooltipPosition = 'top' }: PermissionGateProps) => {
  const { hasPermission } = usePermissions();

  return hasPermission(scopeKind) ? (
    children
  ) : (
    <Tooltip text={fallbackText} position={tooltipPosition} asChild>
      {React.cloneElement(children, {
        disabled: true,
      })}
    </Tooltip>
  );
};

export default PermissionGate;
