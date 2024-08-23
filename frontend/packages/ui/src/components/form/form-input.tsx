import { forwardRef, useContext } from 'react';
import TextInput, { type TextInputProps } from '../text-input';
import formFieldContext from './form-field-context';

export const FormInput = forwardRef<HTMLInputElement, TextInputProps>(({ ...props }, ref) => {
  const { id: contextId } = useContext(formFieldContext);
  return <TextInput id={contextId} size="compact" {...props} ref={ref} />;
});

export default FormInput;
