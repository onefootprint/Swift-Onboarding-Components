import { OrgRole } from '@onefootprint/types';
import React from 'react';

import Actions from './components/actions';
import Scopes from './components/scopes';

export type RowProps = {
  role: OrgRole;
};

const Row = ({ role }: RowProps) => {
  const { name, scopes, isImmutable, createdAt, numActiveUsers } = role;

  return (
    <>
      <td>{name}</td>
      <td>{numActiveUsers}</td>
      <td>
        <Scopes scopes={scopes} />
      </td>
      <td>{createdAt}</td>
      <td>{isImmutable ? null : <Actions role={role} />}</td>
    </>
  );
};

export default Row;
