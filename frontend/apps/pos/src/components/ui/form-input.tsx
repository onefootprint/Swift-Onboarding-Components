import { cx } from 'class-variance-authority';
import { type InputHTMLAttributes, forwardRef } from 'react';

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
};

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({ id, className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      id={id}
      className={cx(
        'w-full h-10 px-4 text-body-3 bg-white border border-gray-150 text-black outline-none hover:border-gray-300 focus:border-gray-600',
        className,
      )}
      {...props}
    />
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
