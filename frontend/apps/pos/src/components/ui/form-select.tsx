import { cx } from 'class-variance-authority';
import { type SelectHTMLAttributes, forwardRef } from 'react';

type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
};

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(({ id, className = '', children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      id={id}
      className={cx(
        'w-full h-10 px-4 pr-8 text-body-3 bg-white border border-gray-150 text-black outline-none hover:border-gray-300 focus:border-gray-600 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20width%3D%2716%27%20height%3D%2716%27%20viewBox%3D%270%200%2016%2016%27%20fill%3D%27none%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20fill-rule%3D%27evenodd%27%20clip-rule%3D%27evenodd%27%20d%3D%27M4.23966%205.70041C4.5432%205.41856%205.01775%205.43613%205.2996%205.73966L8%208.64779L10.7004%205.73966C10.9823%205.43613%2011.4568%205.41856%2011.7603%205.70041C12.0639%205.98226%2012.0815%206.45681%2011.7996%206.76034L8.5496%2010.2603C8.40769%2010.4132%208.20855%2010.5%208%2010.5C7.79145%2010.5%207.59232%2010.4132%207.45041%2010.2603L4.20041%206.76034C3.91856%206.45681%203.93613%205.98226%204.23966%205.70041Z%27%20fill%3D%27black%27%2F%3E%3C%2Fsvg%3E")] bg-no-repeat bg-[center_right_1rem]',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;
