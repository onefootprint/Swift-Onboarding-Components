import * as RadixSelect from '@radix-ui/react-select';
import { cx } from 'class-variance-authority';

type TriggerProps = RadixSelect.SelectTriggerProps;

const Trigger = ({ children, className, ...props }: TriggerProps) => {
  return (
    <RadixSelect.Trigger
      className={cx(
        'text-body-3 flex flex-row items-center justify-center max-w-full',
        '[&_.icon-component]:rotate-0 [&_.icon-component]:transition-transform [&_.icon-component]:duration-100 [&_.icon-component]:ease-in-out',
        '[&[data-state=open]>.icon-component]:-rotate-180',
        className,
      )}
      {...props}
    >
      {children}
    </RadixSelect.Trigger>
  );
};

export default Trigger;
