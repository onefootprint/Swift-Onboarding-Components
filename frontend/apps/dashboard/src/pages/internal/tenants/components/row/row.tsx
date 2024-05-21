import type { Tenant } from '@onefootprint/types';
import { CodeInline } from '@onefootprint/ui';
import React from 'react';

type TenantProps = {
  tenant: Tenant;
};

const Row = ({ tenant }: TenantProps) => (
  <>
    <td>{tenant.name}</td>
    <td>
      <CodeInline isPrivate truncate>
        {tenant.id}
      </CodeInline>
    </td>
    <td>
      {tenant.superTenantId && (
        <CodeInline isPrivate truncate>
          {tenant.superTenantId}
        </CodeInline>
      )}
    </td>
    <td>{tenant.numLiveVaults}</td>
    <td>{tenant.numSandboxVaults}</td>
    <td>{tenant.createdAt}</td>
  </>
);

export default Row;
