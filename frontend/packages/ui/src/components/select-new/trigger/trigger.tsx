import { IcoChevronDown16 } from '@onefootprint/icons';
import * as Select from '@radix-ui/react-select';
import { cva, cx } from 'class-variance-authority';

import type { TriggerProps } from '../select-new.types';

const Trigger = ({ size, disabled, placeholder, ariaLabel, className }: TriggerProps & { className?: string }) => {
  return (
    <Select.Trigger
      aria-label={ariaLabel}
      className={cx(
        'flex items-center justify-between cursor-pointer bg-input-default text-input-color rounded border border-solid border-input-default gap-2',
        'hover:border-input-hover',
        'data-[state=open]:[&_[role=icon]]:rotate-180',
        'data-[placeholder=true]:text-input-placeholder',
        'data-[disabled]:bg-input-disabled data-[disabled]:border-input-disabled data-[disabled]:text-input-disabled',
        trigger({ size }),
        className,
      )}
    >
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
        <Select.Value placeholder={placeholder} />
      </span>
      <Select.Icon className="flex items-center justify-center transition-transform duration-100 ease-in">
        <IcoChevronDown16 color={disabled ? 'quaternary' : 'secondary'} />
      </Select.Icon>
    </Select.Trigger>
  );
};

const trigger = cva([], {
  variants: {
    size: {
      compact: 'text-body-3 h-8 px-3 py-2',
      default: 'text-body-2 h-10 px-4 py-3',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export default Trigger;
