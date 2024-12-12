import type { AuditEventName } from '@onefootprint/request-types/dashboard';
import { Checkbox, Divider, Drawer, Radio, Toggle } from '@onefootprint/ui';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FilterButton from 'src/components/filter-button';
import useSecurityLogsFilters from 'src/hooks/use-security-logs-filters';

type FormValues = {
  date_range: string;
  showAllEvents: boolean;
} & Record<AuditEventName, boolean>;

const Filters = () => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'filters' });
  const { t: tEvents } = useTranslation('security-logs', { keyPrefix: 'filters.events' });
  const { t: tUi } = useTranslation('ui', { keyPrefix: 'components.filters.date-options' });
  const [isOpen, setIsOpen] = useState(false);
  const { push, clear, query } = useSecurityLogsFilters();
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
    'decrypt_org_api_key',
    'update_org_api_key_status',
    'update_org_api_key_role',
    'manually_review_entity',
  ];
  const { register, handleSubmit, reset, control, setValue } = useForm<FormValues>({
    defaultValues: {
      showAllEvents: true,
      ...filters.reduce((acc, filter) => ({ ...acc, [filter]: true }), {}),
    },
  });
  const showAllEvents = useWatch({ control, name: 'showAllEvents' });

  const closeDialog = () => setIsOpen(false);

  const onSubmit = (data: FormValues) => {
    const selectedEvents = data.showAllEvents ? [] : filters.filter(filter => data[filter]);
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
        {t('cta')} {query.names?.length ? `(${query.names?.length})` : ''}
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
          <div className="flex flex-col gap-4">
            <h2 className="text-primary text-label-2">{t('events.header')}</h2>
            <Controller
              control={control}
              name="showAllEvents"
              render={({ field }) => (
                <Toggle
                  size="compact"
                  onBlur={field.onBlur}
                  onChange={nextValue => {
                    field.onChange(nextValue);
                    // Reset all filters to false when toggling to show all events
                    if (nextValue) {
                      filters.forEach(filter => setValue(filter, false));
                    }
                  }}
                  checked={field.value}
                  label={t('events.show-all-events')}
                />
              )}
            />

            {!showAllEvents && (
              <>
                <Divider variant="secondary" />
                <h3 className="text-primary text-label-3">{t('events.only-selected-events')}</h3>
                <div className="flex flex-col gap-3">
                  {filters.map(filter => (
                    <Checkbox key={filter} {...register(filter)} label={tEvents(filter)} />
                  ))}
                </div>
              </>
            )}
            <Divider variant="secondary" />
            <div className="flex flex-col gap-4">
              <h2 className="text-primary text-label-2">{t('dates.header')}</h2>
              <div className="flex flex-col gap-2">
                <Radio value="all-time" label={tUi('all-time')} {...register('date_range')} defaultChecked />
                <Radio value="today" label={tUi('today')} {...register('date_range')} />
                <Radio value="last-7-days" label={tUi('last-7-days')} {...register('date_range')} />
                <Radio value="last-30-days" label={tUi('last-30-days')} {...register('date_range')} />
                <Radio value="custom" label={tUi('custom')} {...register('date_range')} />
              </div>
            </div>
          </div>
        </form>
      </Drawer>
    </>
  );
};

export default Filters;
