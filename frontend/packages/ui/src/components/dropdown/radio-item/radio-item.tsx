import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import BaseItem from '../base-item';
import type { RadioItemProps } from '../dropdown.types';

const RadioItem = ({ value, children, height, onSelect }: RadioItemProps) => {
  return (
    <RadixDropdown.RadioItem value={value} onSelect={onSelect} asChild>
      <BaseItem $layout="radio-item" $height={height}>
        {children}
      </BaseItem>
    </RadixDropdown.RadioItem>
  );
};

export default RadioItem;
