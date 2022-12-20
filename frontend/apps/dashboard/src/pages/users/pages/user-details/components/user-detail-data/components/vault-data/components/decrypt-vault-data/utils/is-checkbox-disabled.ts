import { IdDocDataValue, KycDataValue } from 'src/hooks/use-user';

const isCheckboxDisabled = (value?: KycDataValue | IdDocDataValue) =>
  value !== undefined && value !== null;

export default isCheckboxDisabled;
