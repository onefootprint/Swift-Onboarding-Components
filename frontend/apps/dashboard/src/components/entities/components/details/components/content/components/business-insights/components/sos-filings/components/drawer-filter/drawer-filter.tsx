import { Checkbox, Drawer, Stack, createFontStyles } from '@onefootprint/ui';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FilterButton from 'src/components/filter-button';
import styled, { css } from 'styled-components';
import useInitialSOSFilingsFilters from '../../hooks/use-initial-sos-filings-filters';
import useSOSFilingsFilters from '../../hooks/use-sos-filings-filters';

export type FormData = {
  states: string[];
};

type DrawerFilterProps = {
  states: string[];
};

const DrawerFilter = ({ states }: DrawerFilterProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'business-insights.sos-filings.filters',
  });
  const [open, setOpen] = useState(false);
  const filters = useSOSFilingsFilters();
  const { hasFilters } = filters;
  const { defaultValues, emptyValues } = useInitialSOSFilingsFilters();
  const methods = useForm<FormData>({
    defaultValues,
  });
  const { register, handleSubmit, reset } = methods;

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
      <FilterButton onClick={openDrawer} data-checked={hasFilters}>
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
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Stack direction="column" justify="space-between" height="100%" gap={7}>
              <fieldset>
                <Legend>{t('states.label')}</Legend>
                <Stack direction="column" gap={3}>
                  {states.map(state => (
                    <Checkbox key={state} label={state} value={state} {...register('states')} />
                  ))}
                </Stack>
              </fieldset>
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
