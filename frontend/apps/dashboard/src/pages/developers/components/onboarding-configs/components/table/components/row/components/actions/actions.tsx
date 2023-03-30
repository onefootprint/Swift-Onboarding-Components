import { DEMO_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { OnboardingConfig, RoleScope } from '@onefootprint/types';
import { Box, Dropdown } from '@onefootprint/ui';
import Link from 'next/link';
import React, { useRef } from 'react';
import PermissionGate from 'src/components/permission-gate';
import styled from 'styled-components';

import EditName, { EditNameHandler } from './components/edit-name';
import Status, { StatusHandler } from './components/status';

type ActionsProps = {
  onboardingConfig: OnboardingConfig;
};

const Actions = ({ onboardingConfig }: ActionsProps) => {
  const { name, isLive, key } = onboardingConfig;
  const { t } = useTranslation(
    'pages.developers.onboarding-configs-new.actions',
  );
  const statusRef = useRef<StatusHandler>(null);
  const editNameRef = useRef<EditNameHandler>(null);

  const handleToggleStatus = () => {
    statusRef.current?.toggle();
  };

  const launchEditName = () => {
    editNameRef.current?.launch();
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
          >
            {t('edit-name.cta')}
          </Dropdown.Item>
          {isLive ? null : (
            <TestLink
              href={`${DEMO_BASE_URL}/preview?ob_key=${key}`}
              target="_blank"
              onClick={event => event.stopPropagation()}
            >
              <Dropdown.Item>{t('test')}</Dropdown.Item>
            </TestLink>
          )}
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
        </Dropdown.Content>
      </Dropdown.Root>
      <Status onboardingConfig={onboardingConfig} ref={statusRef} />
      <EditName onboardingConfig={onboardingConfig} ref={editNameRef} />
    </Box>
  );
};

const TestLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

export default Actions;
