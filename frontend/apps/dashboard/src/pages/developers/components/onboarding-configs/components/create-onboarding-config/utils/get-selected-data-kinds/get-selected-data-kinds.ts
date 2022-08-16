import { DataKinds, VirtualDataKinds } from 'src/types/data-kind';

const getSelectedDataKinds = (
  formData: Record<string, boolean | string | number> = {},
) => {
  const dataKindsToShow = new Map();
  Object.entries({ ...DataKinds, ...VirtualDataKinds }).forEach(
    ([, inputName]) => {
      if (formData[inputName]) {
        dataKindsToShow.set(inputName, true);
      }
    },
  );
  return dataKindsToShow;
};

export default getSelectedDataKinds;
