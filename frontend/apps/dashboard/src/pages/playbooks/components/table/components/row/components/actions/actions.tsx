import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { Box, Dropdown, IconButton, Stack } from '@onefootprint/ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';

import type { CopyHandler } from './components/copy';
import Copy from './components/copy';
import type { CopyLinkHandler } from './components/copy-link';
import CopyLink from './components/copy-link';
import type { StatusHandler } from './components/status';
import Status from './components/status';

type ActionsProps = {
  playbook: OnboardingConfiguration;
};

const Actions = ({ playbook }: ActionsProps) => {
  const { name, status, kind } = playbook;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'table.actions',
  });
  const statusRef = useRef<StatusHandler>(null);
  const copyRef = useRef<CopyHandler>(null);
  const copyLinkRef = useRef<CopyLinkHandler>(null);
  const canShowLink = kind === 'kyc' || kind === 'kyb';

  const handleToggleStatus = () => {
    setDropdownOpen(false);
    statusRef.current?.toggle();
  };

  const launchCopy = () => {
    setDropdownOpen(false);
    copyRef.current?.launch();
  };

  const copyLinkToClipboard = () => {
    setDropdownOpen(false);
    copyLinkRef.current?.launch();
  };

  return (
    <Stack justify="flex-end" onClick={e => e.stopPropagation()}>
      <Dropdown.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <PermissionGate scopeKind="onboarding_configuration" fallbackText={t('not-allowed')}>
          <Dropdown.Trigger asChild>
            <Box>
              <IconButton aria-label={t('aria-label', { name })} size="compact">
                <IcoDotsHorizontal24 />
              </IconButton>
            </Box>
          </Dropdown.Trigger>
        </PermissionGate>
        <Dropdown.Portal>
          <Dropdown.Content align="end">
            <Dropdown.Group>
              {canShowLink && (
                <Dropdown.Item onSelect={copyLinkToClipboard} onClick={event => event.stopPropagation()}>
                  {t('get-link')}
                </Dropdown.Item>
              )}
              <PermissionGate scopeKind="onboarding_configuration" fallbackText={t('not-allowed')}>
                <Dropdown.Item onSelect={launchCopy} onClick={event => event.stopPropagation()}>
                  {t('copy')}
                </Dropdown.Item>
              </PermissionGate>
            </Dropdown.Group>
            <Dropdown.Divider />
            <Dropdown.Group>
              <Dropdown.Item
                onSelect={handleToggleStatus}
                onClick={event => event.stopPropagation()}
                variant={playbook.status === 'enabled' ? 'destructive' : undefined}
              >
                {playbook.status === 'enabled' ? t('status.disable.cta') : t('status.enable.cta')}
              </Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
      <Status playbook={playbook} key={status} ref={statusRef} />
      <CopyLink playbook={playbook} ref={copyLinkRef} />
      <Copy playbook={playbook} ref={copyRef} />
    </Stack>
  );
};

export default Actions;
