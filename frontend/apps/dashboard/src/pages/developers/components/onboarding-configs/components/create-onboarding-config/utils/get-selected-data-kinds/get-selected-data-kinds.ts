import { DataKinds } from 'src/types/data-kind';

const getSelectedDataKinds = (
  formData: Record<string, boolean | string | number> = {},
) => {
  const dataKindsToShow = new Map();
  if (formData.name) {
    dataKindsToShow.set('name', true);
  }
  Object.entries(DataKinds).forEach(([, inputName]) => {
    if (formData[inputName]) {
      dataKindsToShow.set(inputName, true);
    }
  });
  return dataKindsToShow;
};

export default getSelectedDataKinds;
