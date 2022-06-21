import { ChangeEvent, useReducer } from 'react';
import { ALL_FIELDS, DataKindType } from 'src/types';

const initialFields = Object.fromEntries(
  ALL_FIELDS.map(x => [x, false]),
) as SelectedFields;

type SelectedFields = Record<DataKindType, boolean>;

const useDataKindSelectedFields = () => {
  const [selectedFields, updateSelectedFields] = useReducer(
    (oldState: SelectedFields, updates: SelectedFields) => ({
      ...oldState,
      ...updates,
    }),
    initialFields,
  );
  const clearSelectedFields = (initialSetValues?: DataKindType[]) => {
    // Clear values, but set some initial fields to true
    const initialSetValuesObj = Object.fromEntries(
      (initialSetValues || []).map(x => [x, true]),
    ) as SelectedFields;
    updateSelectedFields({ ...initialFields, ...initialSetValuesObj });
  };
  const setFieldFor =
    (...kinds: DataKindType[]) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      // Overwrite the selectedFields to match the checkbox value for all of the respective data kinds
      updateSelectedFields(
        Object.fromEntries(
          kinds.map(x => [x, e.target.checked]),
        ) as SelectedFields,
      );
    };

  return {
    selectedFields,
    setFieldFor,
    clearSelectedFields,
  };
};

export default useDataKindSelectedFields;
