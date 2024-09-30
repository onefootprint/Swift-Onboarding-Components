import { forwardRef, useContext } from 'react';
import Checkbox, { type CheckboxProps } from '../checkbox';
import formFieldContext from './form-field-context';

export const FormCheckbox = forwardRef<HTMLInputElement, CheckboxProps>(({ ...props }, ref) => {
  const { id: contextId } = useContext(formFieldContext);
  return <Checkbox id={contextId} {...props} ref={ref} />;
});

export default FormCheckbox;
