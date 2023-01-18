import { IdDocDataValue, KycDataValue } from 'src/pages/users/users.types';

const isCheckboxDisabled = (value?: KycDataValue | IdDocDataValue) =>
  value !== undefined && value !== null;

export default isCheckboxDisabled;
