import type { AuditEventName } from '@onefootprint/request-types/dashboard';
import { Checkbox, Drawer, Stack, Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FilterButton from 'src/components/filter-button';
import useSecurityLogsFilters from 'src/hooks/use-security-logs-filters';

const Filters = () => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'filters' });
  const { t: tEvents } = useTranslation('security-logs', { keyPrefix: 'filters.events' });
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const { push, clear, query } = useSecurityLogsFilters();

  const closeDialog = () => setIsOpen(false);

  const filters: AuditEventName[] = [
    'update_user_data',
    'delete_user_data',
    'decrypt_user_data',
    'create_org_role',
    'update_org_role',
    'deactivate_org_role',
    'invite_org_member',
    'update_org_member',
    'remove_org_member',
    'create_playbook',
    'decrypt_org_api_key',
    'update_org_api_key_status',
    'update_org_api_key_role',
    'manually_review_entity',
  ];

  const onSubmit = (data: Record<string, boolean>) => {
    const selectedEvents = Object.entries(data)
      .filter(([_, isSelected]) => isSelected)
      .map(([eventName]) => eventName);

    push({
      names: selectedEvents,
    });
    closeDialog();
  };

  const handleClear = () => {
    reset();
    clear();
    closeDialog();
  };

  return (
    <>
      <FilterButton onClick={() => setIsOpen(!isOpen)} hasFilters={!!query.names}>
        <Text variant="label-3">{t('cta')}</Text>
      </FilterButton>
      <Drawer
        open={isOpen}
        onClose={closeDialog}
        title={t('apply-filters')}
        primaryButton={{
          label: t('apply'),
          onClick: handleSubmit(onSubmit),
        }}
        linkButton={{
          label: t('clear-filters'),
          onClick: handleClear,
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={4} direction="column">
            <Text variant="label-2">{t('events.header')}</Text>
            <Stack gap={3} direction="column">
              {filters.map(filter => (
                <Stack key={filter} direction="row" gap={4} alignItems="center">
                  <Checkbox {...register(filter)} />
                  <Text variant="body-3">{tEvents(filter)}</Text>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </form>
      </Drawer>
    </>
  );
};

export default Filters;
