import { useIntl, useTranslation } from '@onefootprint/hooks';
import { ProxyConfig } from '@onefootprint/types';
import { Badge } from '@onefootprint/ui';
import React from 'react';

import Actions from './components/actions';

export type RowProps = {
  proxyConfig: ProxyConfig;
};

const Row = ({ proxyConfig }: RowProps) => {
  const { t } = useTranslation('pages.proxy-configs');
  const { formatDateWithTime } = useIntl();
  const { name, url, method, status, createdAt } = proxyConfig;

  return (
    <>
      <td>{name}</td>
      <td>{url}</td>
      <td>{method}</td>
      <td>{formatDateWithTime(new Date(createdAt))}</td>
      <td>
        {status === 'enabled' && (
          <Badge variant="success">{t('status.enabled')}</Badge>
        )}
        {status === 'disabled' && (
          <Badge variant="error">{t('status.disabled')}</Badge>
        )}
      </td>
      <td>
        <Actions proxyConfig={proxyConfig} />
      </td>
    </>
  );
};

export default Row;
