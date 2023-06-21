import { Role } from '@onefootprint/types';
import React from 'react';

import Actions from './components/actions';
import Scopes from './components/scopes';

export type RowProps = {
  role: Role;
};

const Row = ({ role }: RowProps) => {
  const {
    name,
    scopes,
    isImmutable,
    createdAt,
    numActiveUsers,
    numActiveApiKeys,
  } = role;

  return (
    <>
      <td>{name}</td>
      <td>{numActiveUsers}</td>
      <td>{numActiveApiKeys}</td>
      <td>
        <Scopes scopes={scopes} />
      </td>
      <td>{createdAt}</td>
      <td>{isImmutable ? null : <Actions role={role} />}</td>
    </>
  );
};

export default Row;
