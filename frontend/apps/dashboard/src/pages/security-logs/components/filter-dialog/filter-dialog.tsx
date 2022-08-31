import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import {
  FieldErrors,
  useForm,
  UseFormRegister,
  UseFormWatch,
} from 'react-hook-form';
import DataKindBoxes from 'src/components/data-kind-boxes';
import useDataKindSelectedFields from 'src/components/data-kind-boxes/hooks/use-data-kind-selected-fields';
import DateRangeSelector, {
  dateRangeSelectorFormSchema,
  DateRangeSelectorFormValues,
} from 'src/components/date-range-selector';
import {
  DataKind,
  dataKindToType,
  getDateRange,
  serializeDateRange,
} from 'src/types';
import styled from 'styled-components';
import { UserDataAttribute } from 'types';
import { Box, Button, Dialog, Divider, Typography } from 'ui';

import { useFilters } from '../../hooks/use-filters';

type FormValues = DateRangeSelectorFormValues & {
  // TODO move checkboxes to useForm
};

const FilterDialog = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { filters, setFilter } = useFilters();
  const { getValues, register, setValue, watch, trigger, formState } =
    useForm<FormValues>({
      resolver: yupResolver(dateRangeSelectorFormSchema),
    });
  const { selectedFields, setFieldFor, clearSelectedFields } =
    useDataKindSelectedFields();

  const isFieldSelected = (...kinds: DataKind[]) =>
    kinds.every(kind => selectedFields[kind]);
  const isFieldDisabled = () => false;

  const onPrimaryButtonClick = async () => {
    const isValidated = await trigger();
    if (!isValidated) {
      return;
    }
    const fields = Object.entries(selectedFields)
      .filter(x => x[1])
      .map(x => UserDataAttribute[x[0] as DataKind])
      .join(',');
    setFilter({
      dataKinds: fields,
      dateRange: serializeDateRange(
        ...getValues(['dateRange', 'customDateStart', 'customDateEnd']),
      ),
    });
    setShowDialog(false);
  };
  const onClearButtonClick = () => {
    setFilter({ dataKinds: undefined, dateRange: undefined });
    clearSelectedFields();
    setShowDialog(false);
  };
  const openDialog = () => {
    // Refresh the state of the dialog and open it
    const dataKindsStr = filters.dataKinds || '';
    const initialSelectedFields = (
      dataKindsStr.length ? dataKindsStr.split(',') : []
    ).map(x => dataKindToType[x as UserDataAttribute]);
    clearSelectedFields(initialSelectedFields);
    const [dateRange, customDateStart, customDateEnd] = getDateRange(filters);
    setValue('dateRange', dateRange);
    setValue('customDateStart', customDateStart);
    setValue('customDateEnd', customDateEnd);
    setShowDialog(true);
  };

  return (
    <>
      <Dialog
        size="compact"
        title="Filters"
        primaryButton={{
          label: 'Apply',
          onClick: onPrimaryButtonClick,
        }}
        linkButton={{
          label: 'Clear',
          onClick: onClearButtonClick,
        }}
        onClose={() => setShowDialog(false)}
        open={showDialog}
      >
        <Typography variant="label-1" sx={{ marginBottom: 6 }}>
          Data attributes
        </Typography>
        <DataKindBoxes
          isFieldDisabled={isFieldDisabled}
          isFieldSelected={isFieldSelected}
          setFieldFor={setFieldFor}
        />
        <Box sx={{ marginTop: 7, marginBottom: 7 }}>
          <Divider />
        </Box>
        <Typography variant="label-1" sx={{ marginBottom: 6 }}>
          Date range
        </Typography>
        <DateRangeSelector
          register={
            register as unknown as UseFormRegister<DateRangeSelectorFormValues>
          }
          errors={formState.errors as FieldErrors<DateRangeSelectorFormValues>}
          watch={watch as unknown as UseFormWatch<DateRangeSelectorFormValues>}
        />
      </Dialog>
      <FilterButtonContainer>
        <Button size="small" variant="secondary" onClick={openDialog}>
          Filters
        </Button>
      </FilterButtonContainer>
    </>
  );
};

const FilterButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;

export default FilterDialog;
