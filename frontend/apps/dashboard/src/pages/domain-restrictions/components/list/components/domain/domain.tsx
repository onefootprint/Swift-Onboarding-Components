import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { RoleScopeKind } from '@onefootprint/types';
import { Dropdown, Stack, Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';

type DomainProps = {
  domain: string;
  onRemove: (domain: string) => void;
};

const Domain = ({ domain, onRemove }: DomainProps) => {
  const { t } = useTranslation('domain-restrictions');

  return (
    <Stack
      gap={3}
      justify="space-between"
      paddingLeft={3}
      paddingRight={3}
      role="listitem"
      aria-label={domain}
    >
      <Typography variant="body-2">{domain}</Typography>
      <Dropdown.Root>
        <PermissionGate
          scopeKind={RoleScopeKind.onboardingConfiguration}
          fallbackText={t('not-allowed')}
        >
          <Dropdown.Trigger
            aria-label={t('list.actions', { domain }) as string}
          >
            <IcoDotsHorizontal24 />
          </Dropdown.Trigger>
        </PermissionGate>
        <Dropdown.Content align="end">
          <Dropdown.Item
            onSelect={() => {
              onRemove(domain);
            }}
            onClick={event => event.stopPropagation()}
            variant="destructive"
          >
            {t('list.remove')}
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
    </Stack>
  );
};

export default Domain;
