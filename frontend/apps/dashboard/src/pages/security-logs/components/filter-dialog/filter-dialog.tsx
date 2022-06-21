import React, { useState } from 'react';
import DataKindBoxes from 'src/components/data-kind-boxes';
import useDataKindSelectedFields from 'src/components/data-kind-boxes/hooks/use-data-kind-selected-fields';
import { DataKind, dataKindToType, DataKindType } from 'src/types';
import { Button, Dialog, Typography } from 'ui';

import { useFilters } from '../../hooks/use-filters';

const FilterDialog = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { filters, setFilter } = useFilters();
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
    setFilter({ dataKinds: fields });
    setShowDialog(false);
  };
  const onClearButtonClick = () => {
    setFilter({ dataKinds: undefined });
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
      </Dialog>
      <Button size="small" variant="secondary" onClick={openDialog}>
        Filters
      </Button>
    </>
  );
};

export default FilterDialog;
