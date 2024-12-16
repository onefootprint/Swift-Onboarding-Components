import type { ReactNode } from 'react';

type FormLabelProps = {
  children: ReactNode;
  htmlFor: string;
};

const FormLabel = ({ children, htmlFor }: FormLabelProps) => {
  return (
    <label className="block mb-2 text-label-3 text-primary text-left" htmlFor={htmlFor}>
      {children}
    </label>
  );
};

export default FormLabel;
