import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import type { ProxyConfig } from '@onefootprint/types';
import { RoleScopeKind } from '@onefootprint/types';
import { Dropdown, Stack } from '@onefootprint/ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';

import type { RemoveHandler } from './components/remove';
import Remove from './components/remove';
import type { StatusHandler } from './components/status';
import Status from './components/status';

export type ActionsProps = {
  proxyConfig: ProxyConfig;
};

const Actions = ({ proxyConfig }: ActionsProps) => {
  const { name } = proxyConfig;
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.proxy-configs.actions',
  });
  const statusRef = useRef<StatusHandler>(null);
  const removeRef = useRef<RemoveHandler>(null);

  const handleToggleStatus = () => {
    statusRef.current?.toggle();
  };

  const handleRemove = () => {
    removeRef.current?.remove();
  };

  return (
    <Stack justify="flex-end">
      <Dropdown.Root>
        <PermissionGate scopeKind={RoleScopeKind.manageVaultProxy} fallbackText={t('not-allowed')}>
          <Dropdown.Trigger aria-label={t('aria-label', { name })}>
            <IcoDotsHorizontal24 />
          </Dropdown.Trigger>
        </PermissionGate>
        <Dropdown.Content align="end">
          <Dropdown.Item onSelect={handleToggleStatus} onClick={event => event.stopPropagation()}>
            {proxyConfig.status === 'enabled' ? t('status.disable.cta') : t('status.enable.cta')}
          </Dropdown.Item>
          <Dropdown.Item onSelect={handleRemove} onClick={event => event.stopPropagation()} variant="destructive">
            {t('remove.cta')}
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
      <Status proxyConfig={proxyConfig} ref={statusRef} />
      <Remove proxyConfig={proxyConfig} ref={removeRef} />
    </Stack>
  );
};

export default Actions;
