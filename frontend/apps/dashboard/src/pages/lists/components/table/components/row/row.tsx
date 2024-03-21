import type { List } from '@onefootprint/types';
import React from 'react';

export type RowProps = {
  list: List;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Row = ({ list }: RowProps) => (
  // TODO: implement
  <div>
    <div>{list.name}</div>
    <div>{list.kind}</div>
    <div>{list.alias}</div>
  </div>
);
export default Row;
