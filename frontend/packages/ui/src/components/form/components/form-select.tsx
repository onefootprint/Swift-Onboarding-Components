import { forwardRef, useContext } from 'react';
import NativeSelect, { type NativeSelectProps } from '../../native-select';
import formFieldContext from './form-field-context';

export const FormSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(({ ...props }, ref) => {
  const { id: contextId } = useContext(formFieldContext);
  return <NativeSelect data-dd-privacy="mask" id={contextId} {...props} ref={ref} />;
});

export default FormSelect;
