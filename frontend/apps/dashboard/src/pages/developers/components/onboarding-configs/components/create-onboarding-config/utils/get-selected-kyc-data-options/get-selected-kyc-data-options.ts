import { CollectedKycDataOption } from '@onefootprint/types';

export const getSelectedKycDataOptionsList = (
  formData: Record<string, boolean | string | number> = {},
) => {
  const dataOptionsToShow: CollectedKycDataOption[] = [];
  Object.entries({ ...CollectedKycDataOption }).forEach(([, inputName]) => {
    if (formData[inputName]) {
      dataOptionsToShow.push(inputName);
    }
  });
  return dataOptionsToShow;
};

export const getSelectedKycDataOptions = (
  formData: Record<string, boolean | string | number> = {},
) => {
  const dataOptionsToShow = new Map();
  getSelectedKycDataOptionsList(formData).forEach(k =>
    dataOptionsToShow.set(k, true),
  );
  return dataOptionsToShow;
};
