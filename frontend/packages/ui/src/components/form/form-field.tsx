import { useId, useMemo } from 'react';
import Box from '../box';
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
      {variant === 'vertical' && <Box>{children}</Box>}
      {variant === 'horizontal' && (
        <Stack justifyContent="space-between" alignItems="center">
          {children}
        </Stack>
      )}
    </FormFieldContext.Provider>
  );
};

export default FormField;
