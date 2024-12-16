import type { ReactNode } from 'react';

type FormErrorProps = {
  children: ReactNode;
};

const FormError = ({ children }: FormErrorProps) => {
  if (!children) return null;
  return <p className="mt-1.5 text-sm text-error">{children}</p>;
};

export default FormError;
