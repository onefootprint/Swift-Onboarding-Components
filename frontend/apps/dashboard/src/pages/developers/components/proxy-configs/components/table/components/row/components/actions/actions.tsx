import { useTranslation } from '@onefootprint/hooks';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { ProxyConfig, RoleScope } from '@onefootprint/types';
import { Box, Dropdown } from '@onefootprint/ui';
import React, { useRef } from 'react';
import PermissionGate from 'src/components/permission-gate';

import Remove, { RemoveHandler } from './components/remove';
import Status, { StatusHandler } from './components/status';

export type ActionsProps = {
  proxyConfig: ProxyConfig;
};

// TODO: use the correct permission
// https://linear.app/footprint/issue/FP-2952/vault-proxy-use-the-correct-permission
const Actions = ({ proxyConfig }: ActionsProps) => {
  const { name } = proxyConfig;
  const { t } = useTranslation('pages.proxy-configs.actions');
  const statusRef = useRef<StatusHandler>(null);
  const removeRef = useRef<RemoveHandler>(null);

  const handleToggleStatus = () => {
    statusRef.current?.toggle();
  };

  const handleRemove = () => {
    removeRef.current?.remove();
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Dropdown.Root>
        <PermissionGate
          scope={RoleScope.apiKeys}
          fallbackText={t('not-allowed')}
        >
          <Dropdown.Trigger aria-label={t('aria-label', { name })}>
            <IcoDotsHorizontal24 />
          </Dropdown.Trigger>
        </PermissionGate>
        <Dropdown.Content align="end">
          <Dropdown.Item
            onSelect={handleToggleStatus}
            onClick={event => event.stopPropagation()}
          >
            {proxyConfig.status === 'enabled'
              ? t('status.disable.cta')
              : t('status.enable.cta')}
          </Dropdown.Item>
          <Dropdown.Item
            onSelect={handleRemove}
            onClick={event => event.stopPropagation()}
          >
            {t('remove.cta')}
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
      <Status proxyConfig={proxyConfig} ref={statusRef} />
      <Remove proxyConfig={proxyConfig} ref={removeRef} />
    </Box>
  );
};

export default Actions;
