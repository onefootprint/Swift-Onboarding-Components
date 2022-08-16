import { DataKinds } from 'src/types/data-kind';

const transformDataKindFormToArray = (formData: Record<string, any>) => {
  const array: DataKinds[] = [];
  if (formData.name) {
    array.push(DataKinds.firstName);
    array.push(DataKinds.lastName);
  }
  if (formData.address_full) {
    array.push(DataKinds.zip);
    array.push(DataKinds.city);
    array.push(DataKinds.country);
    array.push(DataKinds.state);
    array.push(DataKinds.streetAddress);
    array.push(DataKinds.streetAddress2);
  }
  if (formData.address_partial) {
    array.push(DataKinds.zip);
    array.push(DataKinds.country);
  }
  Object.entries(DataKinds).forEach(([, inputName]) => {
    if (formData[inputName]) {
      array.push(inputName);
    }
  });
  return array;
};

export default transformDataKindFormToArray;
