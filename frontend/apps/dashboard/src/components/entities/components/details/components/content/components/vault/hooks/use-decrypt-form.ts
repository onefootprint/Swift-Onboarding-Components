import type { DataIdentifier } from '@onefootprint/types';
import get from 'lodash/get';
import { useFormContext, useWatch } from 'react-hook-form';

const useDecryptForm = () => {
  const { setValue, getValues } = useFormContext();
  const values = { ...useWatch(), ...getValues() };

  const set = (dis: DataIdentifier[], value: boolean) => {
    dis.forEach(di => setValue(di, value));
  };

  // We need to use lodash get because react-hook-form transforms the data
  // to something like { document: { finra_compliance_letter: boolean } }
  const isChecked = (di: DataIdentifier) => get(values, di);

  return { isChecked, set };
};

export default useDecryptForm;
