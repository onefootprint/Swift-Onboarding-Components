import { useTranslation } from '@onefootprint/hooks';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { OnboardingConfig, RoleScopeKind } from '@onefootprint/types';
import { Box, Dropdown } from '@onefootprint/ui';
import React, { useRef } from 'react';
import PermissionGate from 'src/components/permission-gate';

import EditName, { EditNameHandler } from './components/edit-name';
import Status, { StatusHandler } from './components/status';
import getPermanentLink from './utils/get-permanent-link';

type ActionsProps = {
  onboardingConfig: OnboardingConfig;
};

const Actions = ({ onboardingConfig }: ActionsProps) => {
  const { name, status } = onboardingConfig;
  const { t } = useTranslation('pages.developers.onboarding-configs.actions');
  const statusRef = useRef<StatusHandler>(null);
  const editNameRef = useRef<EditNameHandler>(null);

  const handleToggleStatus = () => {
    statusRef.current?.toggle();
  };

  const launchEditName = () => {
    editNameRef.current?.launch();
  };

  const copyLinkToClipboard = () => {
    const permanentLink = getPermanentLink(onboardingConfig);
    navigator.clipboard.writeText(permanentLink);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
            onSelect={launchEditName}
            onClick={event => event.stopPropagation()}
          >
            {t('edit-name.cta')}
          </Dropdown.Item>
          <Dropdown.Item
            onSelect={handleToggleStatus}
            onClick={event => event.stopPropagation()}
            variant={
              onboardingConfig.status === 'enabled' ? 'destructive' : undefined
            }
          >
            {onboardingConfig.status === 'enabled'
              ? t('status.disable.cta')
              : t('status.enable')}
          </Dropdown.Item>
          <Dropdown.Item
            onSelect={copyLinkToClipboard}
            onClick={event => event.stopPropagation()}
          >
            {t('get-link.cta')}
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
      <Status
        onboardingConfig={onboardingConfig}
        key={status}
        ref={statusRef}
      />
      <EditName
        onboardingConfig={onboardingConfig}
        ref={editNameRef}
        key={name}
      />
    </Box>
  );
};

export default Actions;
