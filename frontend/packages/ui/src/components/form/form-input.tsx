import { forwardRef, useContext } from 'react';
import TextInput, { type TextInputProps } from '../text-input';
import formFieldContext from './form-field-context';

export const FormInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ name, disabled, defaultValue, type, ...props }, ref) => {
    const { id: contextId } = useContext(formFieldContext);
    return (
      <TextInput
        id={contextId}
        name={name}
        disabled={disabled}
        defaultValue={defaultValue}
        type={type}
        size="compact"
        {...props}
        ref={ref}
      />
    );
  },
);

FormInput.displayName = 'FormInput';

export default FormInput;
