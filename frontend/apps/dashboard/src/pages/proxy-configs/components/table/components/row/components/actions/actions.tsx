import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import type { ProxyConfig } from '@onefootprint/types';
import { Box, Dropdown, IconButton, Stack } from '@onefootprint/ui';
import { useRef, useState } from 'react';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { name } = proxyConfig;
  const { t } = useTranslation('proxy-configs', {
    keyPrefix: 'actions',
  });
  const statusRef = useRef<StatusHandler>(null);
  const removeRef = useRef<RemoveHandler>(null);

  const handleToggleStatus = () => {
    setDropdownOpen(false);
    statusRef.current?.toggle();
  };

  const handleRemove = () => {
    setDropdownOpen(false);
    removeRef.current?.remove();
  };

  return (
    <Stack justify="flex-end" onClick={e => e.stopPropagation()}>
      <Dropdown.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <PermissionGate scopeKind="manage_vault_proxy" fallbackText={t('not-allowed')}>
          <Dropdown.Trigger asChild>
            <Box>
              <IconButton aria-label={t('aria-label', { name })} size="tiny">
                <IcoDotsHorizontal24 />
              </IconButton>
            </Box>
          </Dropdown.Trigger>
        </PermissionGate>
        <Dropdown.Portal>
          <Dropdown.Content align="end">
            <Dropdown.Group>
              <Dropdown.Item onSelect={handleToggleStatus}>
                {proxyConfig.status === 'enabled' ? t('status.disable.cta') : t('status.enable.cta')}
              </Dropdown.Item>
              <Dropdown.Item onSelect={handleRemove} variant="destructive">
                {t('remove.cta')}
              </Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
      <Status proxyConfig={proxyConfig} ref={statusRef} />
      <Remove proxyConfig={proxyConfig} ref={removeRef} />
    </Stack>
  );
};

export default Actions;
