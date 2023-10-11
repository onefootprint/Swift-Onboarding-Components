import { useTranslation } from '@onefootprint/hooks';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import type { OnboardingConfig } from '@onefootprint/types';
import { RoleScopeKind } from '@onefootprint/types';
import { Dropdown, Stack } from '@onefootprint/ui';
import React, { useRef } from 'react';
import PermissionGate from 'src/components/permission-gate';

import type { CopyLinkHandler } from './components/copy-link';
import CopyLink from './components/copy-link';
import type { EditNameHandler } from './components/edit-name';
import EditName from './components/edit-name';
import type { StatusHandler } from './components/status';
import Status from './components/status';

type ActionsProps = {
  playbook: OnboardingConfig;
};

const Actions = ({ playbook }: ActionsProps) => {
  const { name, status } = playbook;
  const { t } = useTranslation('pages.playbooks.table.actions');
  const statusRef = useRef<StatusHandler>(null);
  const editNameRef = useRef<EditNameHandler>(null);
  const copyLinkRef = useRef<CopyLinkHandler>(null);

  const handleToggleStatus = () => {
    statusRef.current?.toggle();
  };

  const launchEditName = () => {
    editNameRef.current?.launch();
  };

  const copyLinkToClipboard = () => {
    copyLinkRef.current?.launch();
  };

  return (
    <Stack justify="flex-end">
      <Dropdown.Root>
        <PermissionGate
          scopeKind={RoleScopeKind.onboardingConfiguration}
          fallbackText={t('not-allowed')}
        >
          <Dropdown.Trigger aria-label={t('aria-label', { name })}>
            <IcoDotsHorizontal24 />
          </Dropdown.Trigger>
        </PermissionGate>
        <Dropdown.Content align="end">
          <Dropdown.Item
            onSelect={copyLinkToClipboard}
            onClick={event => event.stopPropagation()}
          >
            {t('get-link.cta')}
          </Dropdown.Item>
          <Dropdown.Item
            onSelect={launchEditName}
            onClick={event => event.stopPropagation()}
          >
            {t('edit-name.cta')}
          </Dropdown.Item>
          <Dropdown.Item
            onSelect={handleToggleStatus}
            onClick={event => event.stopPropagation()}
            variant={playbook.status === 'enabled' ? 'destructive' : undefined}
          >
            {playbook.status === 'enabled'
              ? t('status.disable.cta')
              : t('status.enable')}
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
      <Status playbook={playbook} key={status} ref={statusRef} />
      <EditName playbook={playbook} ref={editNameRef} key={name} />
      <CopyLink playbook={playbook} ref={copyLinkRef} />
    </Stack>
  );
};

export default Actions;
