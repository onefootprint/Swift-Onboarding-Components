import { UserDataAttribute } from '@onefootprint/types';
import { ChangeEvent, useReducer } from 'react';

const initialFields = Object.fromEntries(
  Object.keys(UserDataAttribute).map(k => [k, false]),
) as SelectedFields;

type SelectedFields = Record<UserDataAttribute, boolean>;

const useDataKindSelectedFields = () => {
  const [selectedFields, updateSelectedFields] = useReducer(
    (oldState: SelectedFields, updates: SelectedFields) => ({
      ...oldState,
      ...updates,
    }),
    initialFields,
  );
  const clearSelectedFields = (initialSetValues?: UserDataAttribute[]) => {
    // Clear values, but set some initial fields to true
    const initialSetValuesObj = Object.fromEntries(
      (initialSetValues || []).map(x => [x, true]),
    ) as SelectedFields;
    updateSelectedFields({ ...initialFields, ...initialSetValuesObj });
  };
  const setFieldFor =
    (...kinds: UserDataAttribute[]) =>
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
