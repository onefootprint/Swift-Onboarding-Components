import { forwardRef, useContext } from 'react';
import TextInput, { type TextInputProps } from '../../text-input';
import formFieldContext from './form-field-context';

export const FormInput = forwardRef<HTMLInputElement, TextInputProps>(({ ...props }, ref) => {
  const { id: contextId } = useContext(formFieldContext);
  return <TextInput width="100%" data-dd-privacy="mask" id={contextId} tabIndex={0} {...props} ref={ref} />;
});

export default FormInput;
