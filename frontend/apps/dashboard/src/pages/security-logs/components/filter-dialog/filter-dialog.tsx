import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import DataKindBoxes from 'src/components/data-kind-boxes';
import useDataKindSelectedFields from 'src/components/data-kind-boxes/hooks/use-data-kind-selected-fields';
import {
  DataKind,
  dataKindToType,
  DataKindType,
  DateRange,
  dateRangeToDisplayText,
  getDateRange,
  serializeDateRange,
} from 'src/types';
import { Box, Button, Dialog, Divider, Typography } from 'ui';
import RadioInput from 'ui/src/components/radio-input';

import { useFilters } from '../../hooks/use-filters';

// TODO move checkboxes to useForm
type FormValues = {
  dateRange: DateRange;
};

const FilterDialog = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { filters, setFilter } = useFilters();
  const { getValues, register, setValue } = useForm<FormValues>();
  const { selectedFields, setFieldFor, clearSelectedFields } =
    useDataKindSelectedFields();

  const isFieldSelected = (...kinds: DataKindType[]) =>
    kinds.every(kind => selectedFields[kind]);
  const isFieldDisabled = () => false;

  const onPrimaryButtonClick = () => {
    const fields = Object.entries(selectedFields)
      .filter(x => x[1])
      .map(x => DataKind[x[0] as DataKindType])
      .join(',');
    setFilter({
      dataKinds: fields,
      dateRange: serializeDateRange(getValues('dateRange')),
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
    ).map(x => dataKindToType[x as DataKind]);
    clearSelectedFields(initialSelectedFields);
    // TODO custom date range
    const [dateRange] = getDateRange(filters);
    setValue('dateRange', dateRange);
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
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {[
            DateRange.allTime,
            DateRange.today,
            DateRange.currentMonth,
            DateRange.lastWeek,
            DateRange.lastMonth,
          ].map(value => (
            <RadioInput
              key={value}
              value={value}
              label={dateRangeToDisplayText[value]}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...register('dateRange')}
            />
          ))}
        </Box>
      </Dialog>
      <Button size="small" variant="secondary" onClick={openDialog}>
        Filters
      </Button>
    </>
  );
};

export default FilterDialog;
