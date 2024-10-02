import { forwardRef, useContext } from 'react';
import Radio, { type RadioProps } from '../../radio';
import formFieldContext from './form-field-context';

export const FormRadio = forwardRef<HTMLInputElement, RadioProps>(({ ...props }, ref) => {
  const { id: contextId } = useContext(formFieldContext);
  return <Radio id={contextId} {...props} ref={ref} />;
});

export default FormRadio;
