import { useId, useMemo } from 'react';
import Stack from '../stack';
import FormFieldContext from './form-field-context';

export type FormFieldProps = {
  children: JSX.Element | JSX.Element[];
  variant?: 'vertical' | 'horizontal';
};

const FormField = ({ children, variant = 'vertical' }: FormFieldProps) => {
  const id = useId();
  const contextValues = useMemo(() => ({ id }), [id]);

  return (
    <FormFieldContext.Provider value={contextValues}>
      {variant === 'vertical' && (
        <Stack direction="column" gap={3} width="100%" textOverflow="ellipsis" whiteSpace="nowrap">
          {children}
        </Stack>
      )}
      {variant === 'horizontal' && (
        <Stack justifyContent="space-between" align="center" width="100%">
          {children}
        </Stack>
      )}
    </FormFieldContext.Provider>
  );
};

export default FormField;
