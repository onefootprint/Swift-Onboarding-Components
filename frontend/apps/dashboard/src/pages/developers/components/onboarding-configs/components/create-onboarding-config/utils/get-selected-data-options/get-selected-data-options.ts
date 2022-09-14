import { CollectedDataOption } from 'types';

export const getSelectedDataOptionsList = (
  formData: Record<string, boolean | string | number> = {},
) => {
  const dataOptionsToShow: CollectedDataOption[] = [];
  Object.entries({ ...CollectedDataOption }).forEach(([, inputName]) => {
    if (formData[inputName]) {
      dataOptionsToShow.push(inputName);
    }
  });
  return dataOptionsToShow;
};

export const getSelectedDataOptions = (
  formData: Record<string, boolean | string | number> = {},
) => {
  const dataOptionsToShow = new Map();
  getSelectedDataOptionsList(formData).forEach(k =>
    dataOptionsToShow.set(k, true),
  );
  return dataOptionsToShow;
};
