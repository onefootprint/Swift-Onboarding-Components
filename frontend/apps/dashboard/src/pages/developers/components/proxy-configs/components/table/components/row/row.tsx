import { useIntl } from '@onefootprint/hooks';
import { ProxyConfig } from '@onefootprint/types';
import React from 'react';

export type RowProps = {
  proxy: ProxyConfig;
};

const Row = ({ proxy }: RowProps) => {
  const { formatDateWithTime } = useIntl();
  const { name, url, method, createdAt } = proxy;

  return (
    <>
      <td>{name}</td>
      <td>{url}</td>
      <td>{method}</td>
      <td>{formatDateWithTime(new Date(createdAt))}</td>
      <td />
    </>
  );
};

export default Row;
