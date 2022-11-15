import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from '@onefootprint/hooks';
import { DateRange, OrgRolePermissionKind } from '@onefootprint/types';
import { Box, InputDateRangePicker, Radio } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import Fieldset from 'src/components/fieldset';

export type MemberFiltersFormData = {
  customDate: { from: Date; to: Date };
  dateRange?: DateRange | `${DateRange}(${string},${string})`;
  roles: string[];
  permissions: OrgRolePermissionKind[];
};

type MemberFiltersFormProps = {
  onSubmit: (formData: MemberFiltersFormData) => void;
  defaultValues: {
    customDate: { from: Date; to: Date };
    dateRange: DateRange;
    roles: string[];
    permissions: OrgRolePermissionKind[];
  };
};

const MemberFiltersForm = ({
  onSubmit,
  defaultValues,
}: MemberFiltersFormProps) => {
  const { t } = useTranslation(
    'pages.settings.team-roles.people.filters.dialog.form',
  );
  const { control, register, handleSubmit, reset, watch } =
    useForm<MemberFiltersFormData>({
      defaultValues,
    });
  const [animateCustomDate] = useAutoAnimate<HTMLDivElement>();
  const hasCustomDateRange = watch('dateRange') === DateRange.custom;

  const handleReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset({ dateRange: DateRange.allTime, roles: [], permissions: [] });
  };

  const handleBeforeSubmit = (formData: MemberFiltersFormData) => {
    if (formData.dateRange === DateRange.allTime) {
      onSubmit({ ...formData, dateRange: undefined });
    } else if (formData.dateRange === DateRange.custom) {
      // TODO: Improve
      onSubmit({
        ...formData,
        dateRange: `${
          DateRange.custom
        }(${formData.customDate.from.toLocaleDateString()},${formData.customDate.to.toLocaleDateString()})`,
      });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form
      id="users-filters"
      name="users-filters"
      onReset={handleReset}
      onSubmit={handleSubmit(handleBeforeSubmit)}
    >
      {/* TODO: https://linear.app/footprint/issue/FP-1749/add-roles-and-permissions-filters-for-people-table-design */}
      <Fieldset title={t('date-range.title')}>
        <Radio
          {...register('dateRange')}
          label={t('date-range.all-time')}
          value={DateRange.allTime}
        />
        <Radio
          {...register('dateRange')}
          label={t('date-range.today')}
          value={DateRange.today}
        />
        <Radio
          {...register('dateRange')}
          label={t('date-range.last-month')}
          value={DateRange.lastMonth}
        />
        <Radio
          {...register('dateRange')}
          label={t('date-range.last-week')}
          value={DateRange.lastWeek}
        />
        <Radio
          {...register('dateRange')}
          label={t('date-range.custom')}
          value={DateRange.custom}
        />
        <Box ref={animateCustomDate}>
          {hasCustomDateRange && (
            <Box sx={{ marginLeft: 5, marginBottom: 3 }}>
              <Controller
                name="customDate"
                control={control}
                render={({ field }) => (
                  <InputDateRangePicker
                    startDate={field.value.from}
                    endDate={field.value.to}
                    onChange={(nextStartDate: Date, nextEndDate: Date) => {
                      field.onChange({
                        from: nextStartDate,
                        to: nextEndDate,
                      });
                    }}
                  />
                )}
              />
            </Box>
          )}
        </Box>
      </Fieldset>
    </form>
  );
};

export default MemberFiltersForm;
