import { createContext } from 'react';

const FormFieldContext = createContext<{
  id: string;
}>({
  id: '',
});

export default FormFieldContext;
