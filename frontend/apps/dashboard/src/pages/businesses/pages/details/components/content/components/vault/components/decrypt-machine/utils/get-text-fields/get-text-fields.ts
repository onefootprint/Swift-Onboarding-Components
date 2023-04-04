import { BusinessDI, IdDI, InvestorProfileDI } from '@onefootprint/types';
import get from 'lodash/get';

import { FormData } from '../../../../vault.types';
import { TextField } from '../../types';

const getTextFields = (fields: FormData) => {
  const result: TextField[] = [];

  Object.values(IdDI).forEach(value => {
    const checked = get(fields, value);
    if (checked) {
      result.push(value);
    }
  });

  Object.values(InvestorProfileDI).forEach(value => {
    const checked = get(fields, value);
    if (checked) {
      result.push(value);
    }
  });

  Object.values(BusinessDI).forEach(value => {
    const checked = get(fields, value);
    if (checked) {
      result.push(value);
    }
  });

  if (result.includes(IdDI.firstName)) {
    result.push(IdDI.lastName);
  }

  return result;
};

export default getTextFields;
