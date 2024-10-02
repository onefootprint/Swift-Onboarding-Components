import { forwardRef, useContext } from 'react';
import TextArea, { type TextAreaProps } from '../../text-area';
import formFieldContext from './form-field-context';

export const FormTextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ ...props }, ref) => {
  const { id: contextId } = useContext(formFieldContext);
  return <TextArea data-dd-privacy="mask" id={contextId} {...props} ref={ref} />;
});

export default FormTextArea;
