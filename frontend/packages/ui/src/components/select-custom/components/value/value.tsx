import * as RadixSelect from '@radix-ui/react-select';
import Text from '../../../text';

type ValueProps = RadixSelect.SelectValueProps;

const Value = ({ children, ...props }: ValueProps) => {
  return (
    <RadixSelect.Value {...props} asChild>
      <Text variant="body-3" truncate>
        {children}
      </Text>
    </RadixSelect.Value>
  );
};

export default Value;
