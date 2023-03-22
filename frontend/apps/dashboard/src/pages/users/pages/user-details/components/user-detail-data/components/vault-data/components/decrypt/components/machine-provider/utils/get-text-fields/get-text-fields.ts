import { IdDI } from '@onefootprint/types';

import { Fields, FieldSections, TextField } from '../../types';

const getTextFields = (fields: Fields) => {
  const result: TextField[] = [];
  Object.entries(fields[FieldSections.id]).forEach(([key, value]) => {
    if (value) {
      const newValue = `${FieldSections.id}.${key}`;
      result.push(newValue as unknown as TextField);
      if (newValue === IdDI.firstName) {
        result.push(IdDI.lastName);
      }
    }
  });
  Object.entries(fields[FieldSections.investorProfile]).forEach(
    ([key, value]) => {
      if (value) {
        const newValue = `${FieldSections.investorProfile}.${key}`;
        result.push(newValue as unknown as TextField);
      }
    },
  );
  return result;
};

export default getTextFields;
