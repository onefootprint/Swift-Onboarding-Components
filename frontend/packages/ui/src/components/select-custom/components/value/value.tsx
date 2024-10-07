import { Text } from '@onefootprint/ui';
import * as RadixSelect from '@radix-ui/react-select';

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
