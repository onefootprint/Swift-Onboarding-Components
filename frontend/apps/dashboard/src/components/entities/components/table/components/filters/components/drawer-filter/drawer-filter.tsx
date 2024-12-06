import type { OrgTenantTag } from '@onefootprint/request-types/dashboard';
import { EntityLabel } from '@onefootprint/types';
import { Checkbox, DateRangeInput, Drawer, Radio, Stack, TextInput, createFontStyles } from '@onefootprint/ui';
import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FilterButton from 'src/components/filter-button';
import useSession from 'src/hooks/use-session';
import styled, { css } from 'styled-components';

import useFilters from '../../../../../../hooks/use-filters';
import PlaybookList from './components/playbooks';
import TagsList from './components/tags-list';
import { FiltersDateRange, type FormData } from './drawer-filter.type';
import useDateOptions from './hooks/use-date-options';
import useInitialFilters from './hooks/use-initial-filters';
import transformFormDataToQuery from './utils/transform-form-to-query';

type DrawerFilterProps = {
  tags: OrgTenantTag[];
};

const DrawerFilter = ({ tags }: DrawerFilterProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entities.filters.drawer' });
  const {
    data: { user },
  } = useSession();
  const [open, setOpen] = useState(false);
  const options = useDateOptions();
  const filters = useFilters();
  const { filtersCount, hasFilters } = filters;
  const { defaultValues, initialValues } = useInitialFilters();
  const methods = useForm<FormData>({
    defaultValues,
  });
  const { control, register, handleSubmit, reset, watch } = methods;
  const shouldShowDatePicker = watch('period') === FiltersDateRange.Custom;

  const close = () => {
    setOpen(false);
    reset(defaultValues);
  };

  const openDrawer = () => {
    reset(defaultValues);
    setOpen(true);
  };

  const onSubmit = (formData: FormData) => {
    filters.push({
      ...transformFormDataToQuery(formData),
      cursor: undefined,
    });
    close();
  };

  const handleReset = () => {
    reset(initialValues);
    filters.push({
      date_range: undefined,
      watchlist_hit: undefined,
      has_outstanding_workflow_request: undefined,
      show_unverified: undefined,
      labels: undefined,
      tags: undefined,
      playbook_ids: undefined,
      external_id: undefined,
    });
    close();
  };

  return (
    <>
      <FilterButton onClick={openDrawer} hasFilters={hasFilters}>
        {t('trigger')} {hasFilters && `(${filtersCount})`}
      </FilterButton>
      <Drawer
        title={t('title')}
        open={open}
        onClose={close}
        primaryButton={{ label: t('cta'), onClick: handleSubmit(onSubmit) }}
        linkButton={{ label: t('reset'), onClick: handleReset }}
      >
        <FormProvider {...methods}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Stack direction="column" justify="space-between" height="100%" gap={7}>
              <Stack direction="column" gap={7}>
                <fieldset>
                  <Legend>{t('labels.label')}</Legend>
                  <Stack direction="column" gap={3}>
                    <Checkbox label={t('labels.options.active')} value={EntityLabel.active} {...register('labels')} />
                    <Checkbox
                      label={t('labels.options.fraud')}
                      value={EntityLabel.offboard_fraud}
                      {...register('labels')}
                    />
                    <Checkbox
                      label={t('labels.options.other')}
                      value={EntityLabel.offboard_other}
                      {...register('labels')}
                    />
                  </Stack>
                </fieldset>
                {tags.length ? (
                  <fieldset>
                    <Legend>{t('tags.label')}</Legend>
                    <TagsList tags={tags} />
                  </fieldset>
                ) : null}
                <fieldset>
                  <Legend>{t('created.label')}</Legend>
                  <Stack direction="column" gap={3}>
                    {options?.map(option => (
                      <Radio
                        key={`${option.label}-${option.value}`}
                        label={option.label}
                        value={option.value}
                        {...register('period')}
                      />
                    ))}
                    <div>
                      {shouldShowDatePicker && (
                        <Controller
                          control={control}
                          name="customDate"
                          render={({ field }) => (
                            <DateRangeInput
                              startDate={field.value.from}
                              endDate={field.value.to}
                              onChange={(nextStartDate?: Date, nextEndDate?: Date) => {
                                field.onChange({
                                  from: nextStartDate,
                                  to: nextEndDate,
                                });
                              }}
                            />
                          )}
                        />
                      )}
                    </div>
                  </Stack>
                </fieldset>
                <fieldset>
                  <Legend>{t('playbooks.label')}</Legend>
                  <PlaybookList />
                </fieldset>
                <fieldset>
                  <Legend>{t('other.label')}</Legend>
                  <Stack direction="column" gap={3}>
                    <Checkbox label={t('other.on-watchlist')} value="watchlist_hit" {...register('others')} />
                    <Checkbox
                      label={t('other.has-outstanding-workflow-request')}
                      value="has_outstanding_workflow_request"
                      {...register('others')}
                    />
                    {user?.isFirmEmployee && (
                      <Checkbox label={t('other.show-unverified')} value="show_unverified" {...register('others')} />
                    )}
                  </Stack>
                </fieldset>
                <fieldset>
                  <Legend>{t('other.external-id')}</Legend>
                  <TextInput
                    placeholder={t('other.external-id-placeholder')}
                    {...register('externalId')}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                  />
                </fieldset>
              </Stack>
            </Stack>
          </Form>
        </FormProvider>
      </Drawer>
    </>
  );
};

const Form = styled.form`
  height: 100%;
  width: 100%;
`;

const Legend = styled.legend`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    margin-bottom: ${theme.spacing[5]};
  `}
`;

export default DrawerFilter;
