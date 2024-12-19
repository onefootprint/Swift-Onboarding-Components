import { Checkbox, Drawer } from '@onefootprint/ui';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FilterButton from 'src/components/filter-button';
import useInitialSOSFilingsFilters from '../../hooks/use-initial-sos-filings-filters';
import useSOSFilingsFilters from '../../hooks/use-sos-filings-filters';

export type FormData = {
  states: string[];
};

type DrawerFilterProps = {
  states: string[];
};

const DrawerFilter = ({ states }: DrawerFilterProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.registrations.filters' });
  const [open, setOpen] = useState(false);
  const filters = useSOSFilingsFilters();
  const { defaultValues, emptyValues } = useInitialSOSFilingsFilters();
  const methods = useForm<FormData>({ defaultValues });
  const { register, handleSubmit, reset } = methods;
  const { hasFilters } = filters;

  const openDrawer = () => {
    reset(defaultValues);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    reset(defaultValues);
  };

  const onSubmit = (formData: FormData) => {
    filters.push({ filings_states: [...formData.states] });
    close();
  };

  const handleReset = () => {
    reset(emptyValues);
    filters.push({
      filings_states: undefined,
    });
    close();
  };

  return (
    <>
      <FilterButton onClick={openDrawer} hasFilters={hasFilters}>
        {t('trigger')}
      </FilterButton>
      <Drawer
        title={t('title')}
        open={open}
        onClose={close}
        primaryButton={{ label: t('cta'), onClick: handleSubmit(onSubmit) }}
        secondaryButton={{ label: t('reset'), onClick: handleReset }}
      >
        <FormProvider {...methods}>
          <form className="h-full w-full" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col justify-between gap-6 h-full">
              <fieldset>
                <legend className="text-label-3 mb-4">{t('states.label')}</legend>
                <div className="flex flex-col gap-2">
                  {states.map(state => (
                    <Checkbox key={state} label={state} value={state} {...register('states')} />
                  ))}
                </div>
              </fieldset>
            </div>
          </form>
        </FormProvider>
      </Drawer>
    </>
  );
};

export default DrawerFilter;
