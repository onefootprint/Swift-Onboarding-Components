import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { Dropdown, Stack, Text } from '@onefootprint/ui';
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
      // biome-ignore lint/a11y/useSemanticElements: TODO: change to <li />
      role="listitem"
      aria-label={domain}
    >
      <Text variant="body-2">{domain}</Text>
      <Dropdown.Root>
        <PermissionGate scopeKind="onboarding_configuration" fallbackText={t('list.not-allowed')}>
          <Dropdown.Trigger aria-label={t('list.actions', { domain }) as string}>
            <IcoDotsHorizontal24 />
          </Dropdown.Trigger>
        </PermissionGate>
        <Dropdown.Portal>
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
        </Dropdown.Portal>
      </Dropdown.Root>
    </Stack>
  );
};

export default Domain;
