import { DataKinds } from 'src/types/data-kind';

const transformDataKindFormToArray = (formData: Record<string, boolean>) => {
  const array: DataKinds[] = [];
  if (formData.name) {
    array.push(DataKinds.firstName);
    array.push(DataKinds.lastName);
  }
  Object.entries(DataKinds).forEach(([, inputName]) => {
    if (formData[inputName]) {
      array.push(inputName);
    }
  });
  return array;
};

export default transformDataKindFormToArray;
