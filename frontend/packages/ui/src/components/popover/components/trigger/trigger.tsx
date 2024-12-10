import * as RadixPopover from '@radix-ui/react-popover';
import { cx } from 'class-variance-authority';

export type PopoverTriggerProps = RadixPopover.PopoverTriggerProps & {
  children: React.ReactNode;
  className?: string;
};

const PopoverTrigger = ({ children, className, ...props }: PopoverTriggerProps) => {
  return (
    <RadixPopover.Trigger className={cx('cursor-pointer', className)} {...props}>
      {children}
    </RadixPopover.Trigger>
  );
};

export default PopoverTrigger;
