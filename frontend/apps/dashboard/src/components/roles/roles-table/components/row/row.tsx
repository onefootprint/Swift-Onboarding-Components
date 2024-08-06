import type { Role } from '@onefootprint/types';
import { RoleKind } from '@onefootprint/types';

import Actions from './components/actions';
import Scopes from './components/scopes';

export type RowProps = {
  role: Role;
};

const Row = ({ role }: RowProps) => {
  const { name, scopes, isImmutable, createdAt, numActiveUsers, numActiveApiKeys } = role;

  return (
    <>
      <td>{name}</td>
      {role.kind === RoleKind.dashboardUser ? <td>{numActiveUsers}</td> : <td>{numActiveApiKeys}</td>}
      <td aria-label="scopes">
        <Scopes scopes={scopes} />
      </td>
      <td>{createdAt}</td>
      <td>{isImmutable ? null : <Actions role={role} />}</td>
    </>
  );
};

export default Row;
