import { IcoArrowTopRight24 } from '@onefootprint/icons';
import type { Tenant } from '@onefootprint/types';
import { CodeInline, LinkButton } from '@onefootprint/ui';
import React from 'react';
import Actions from './components/actions/actions';

type TenantProps = {
  tenant: Tenant;
  onAssumeTenant: (tenant: Tenant) => void;
};

const Row = ({ tenant, onAssumeTenant }: TenantProps) => (
  <>
    <td>
      <LinkButton
        iconComponent={IcoArrowTopRight24}
        onClick={e => {
          e.stopPropagation();
          onAssumeTenant(tenant);
        }}
      >
        {tenant.name}
      </LinkButton>
    </td>
    <td>
      <CodeInline isPrivate truncate>
        {tenant.id}
      </CodeInline>
    </td>
    <td>{tenant.numLiveVaults}</td>
    <td>{tenant.numSandboxVaults}</td>
    <td>{tenant.createdAt}</td>
    <td>
      <Actions tenant={tenant} />
    </td>
  </>
);

export default Row;
