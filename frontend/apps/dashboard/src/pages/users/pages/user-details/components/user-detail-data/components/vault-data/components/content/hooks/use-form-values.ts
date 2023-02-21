import { useFormContext, useWatch } from 'react-hook-form';

const useFormValues = () => {
  const { getValues } = useFormContext();

  return {
    ...useWatch(),
    ...getValues(),
  };
};

export default useFormValues;
