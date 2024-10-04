import Box from '../../../box';
import BaseSelectTrigger from '../../../internal/base-select-trigger';
import SelectCustom from '../../select-custom';

type InputProps = {
  placeholder?: string;
  children: React.ReactNode;
  maxWidth?: string;
  minWidth?: string;
  width?: string;
  disabled?: boolean;
  size?: 'default' | 'compact';
  hasError?: boolean;
};

const Input = ({
  children,
  placeholder,
  maxWidth,
  minWidth,
  width,
  size = 'default',
  disabled,
  hasError = false,
}: InputProps) => {
  return (
    <Box maxWidth={maxWidth} minWidth={minWidth} width={width}>
      <SelectCustom.Trigger disabled={disabled} asChild>
        <BaseSelectTrigger size={size} disabled={disabled} data-has-error={hasError}>
          <SelectCustom.Value placeholder={placeholder}>{children}</SelectCustom.Value>
        </BaseSelectTrigger>
      </SelectCustom.Trigger>
    </Box>
  );
};

export default Input;
