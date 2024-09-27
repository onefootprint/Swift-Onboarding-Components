import { useIntl } from '@onefootprint/hooks';
import type { ProxyConfig } from '@onefootprint/types';
import { Badge, CodeInline } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import Actions from './components/actions';

export type RowProps = {
  proxyConfig: ProxyConfig;
};

const Row = ({ proxyConfig }: RowProps) => {
  const { t } = useTranslation('proxy-configs');
  const { formatDateWithTime } = useIntl();
  const { name, url, method, status, createdAt } = proxyConfig;

  return (
    <>
      <td>{name}</td>
      <td>
        <CodeInline truncate>{proxyConfig.id}</CodeInline>
      </td>
      <td>{url}</td>
      <td>{method}</td>
      <td>{formatDateWithTime(new Date(createdAt))}</td>
      <td>
        {status === 'enabled' && <Badge variant="success">{t('status.enabled')}</Badge>}
        {status === 'disabled' && <Badge variant="error">{t('status.disabled')}</Badge>}
      </td>
      <td aria-label="actions">
        <Actions proxyConfig={proxyConfig} />
      </td>
    </>
  );
};

export default Row;
