import Box from '../../../box';
import BaseSelectTrigger from '../../../internal/base-select-trigger';
import SelectCustom from '../../select-custom';

type InputProps = {
  placeholder?: string;
  children: React.ReactNode;
  maxWidth?: string;
  minWidth?: string;
  width?: string;
  size?: 'default' | 'compact';
};

const Input = ({ children, placeholder, maxWidth, minWidth, width, size = 'default' }: InputProps) => {
  return (
    <Box maxWidth={maxWidth} minWidth={minWidth} width={width}>
      <SelectCustom.Trigger asChild>
        <Box>
          <BaseSelectTrigger size={size}>
            <SelectCustom.Value placeholder={placeholder}>{children}</SelectCustom.Value>
          </BaseSelectTrigger>
        </Box>
      </SelectCustom.Trigger>
    </Box>
  );
};

export default Input;
