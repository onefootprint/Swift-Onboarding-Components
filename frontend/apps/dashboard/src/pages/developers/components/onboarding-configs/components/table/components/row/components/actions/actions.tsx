import { useTranslation } from '@onefootprint/hooks';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { OnboardingConfig, RoleScope } from '@onefootprint/types';
import { Box, Dropdown } from '@onefootprint/ui';
import React, { useRef } from 'react';
import PermissionGate from 'src/components/permission-gate';

import EditName, { EditNameHandler } from './components/edit-name';
import Status, { StatusHandler } from './components/status';

type ActionsProps = {
  onboardingConfig: OnboardingConfig;
};

/*
  TODO:
  - Implement launch edit flow
  - Add in feedback toasts
*/

const Actions = ({ onboardingConfig }: ActionsProps) => {
  const { name } = onboardingConfig;
  const { t } = useTranslation('pages.onboarding-configs.actions');
  const statusRef = useRef<StatusHandler>(null);
  const editNameRef = useRef<EditNameHandler>(null);

  const handleToggleStatus = () => {
    statusRef.current?.toggle();
  };

  const launchEditName = () => {
    editNameRef.current?.launch();
  };

  const handleTest = () => {
    // TODO:
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Dropdown.Root>
        <PermissionGate
          scope={RoleScope.onboardingConfiguration}
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
            variant="destructive"
          >
            {t('edit.cta')}
          </Dropdown.Item>
          <Dropdown.Item
            onSelect={handleTest}
            onClick={event => event.stopPropagation()}
            variant="destructive"
          >
            {t('test')}
          </Dropdown.Item>
          <Dropdown.Item
            onSelect={handleToggleStatus}
            onClick={event => event.stopPropagation()}
          >
            {onboardingConfig.status === 'enabled'
              ? t('status.disable.cta')
              : t('status.enable')}
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
      <Status onboardingConfig={onboardingConfig} ref={statusRef} />
      <EditName onboardingConfig={onboardingConfig} />
    </Box>
  );
};

export default Actions;
