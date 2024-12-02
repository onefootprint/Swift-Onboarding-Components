import type { AuditEventName } from '@onefootprint/request-types/dashboard';
import { Checkbox, Divider, Drawer, Radio, Stack, Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FilterButton from 'src/components/filter-button';
import useSecurityLogsFilters from 'src/hooks/use-security-logs-filters';

type FormValues = {
  date_range: string;
} & Record<AuditEventName, boolean>;

const Filters = () => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'filters' });
  const { t: tEvents } = useTranslation('security-logs', { keyPrefix: 'filters.events' });
  const { t: tUi } = useTranslation('ui', { keyPrefix: 'components.filters.date-options' });
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormValues>();
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

  const onSubmit = (data: FormValues) => {
    const selectedEvents = filters.filter(filter => data[filter]);

    push({
      names: selectedEvents,
      date_range: data.date_range,
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
          <Stack gap={7} direction="column">
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
            <Divider variant="secondary" />
            <Stack gap={4} direction="column">
              <Text variant="label-2">{t('dates.header')}</Text>
              <Stack gap={3} direction="column">
                <Radio value="all-time" label={tUi('all-time')} {...register('date_range')} defaultChecked />
                <Radio value="today" label={tUi('today')} {...register('date_range')} />
                <Radio value="last-7-days" label={tUi('last-7-days')} {...register('date_range')} />
                <Radio value="last-30-days" label={tUi('last-30-days')} {...register('date_range')} />
                <Radio value="custom" label={tUi('custom')} {...register('date_range')} />
              </Stack>
            </Stack>
          </Stack>
        </form>
      </Drawer>
    </>
  );
};

export default Filters;
