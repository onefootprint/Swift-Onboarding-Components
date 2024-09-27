import { TextInput } from '@onefootprint/ui';
import { FIELD_VALUE_WIDTH } from '../../constants';

const EncryptedInput = () => (
  <TextInput
    data-dd-privacy="mask"
    size="compact"
    placeholder=""
    disabled
    defaultValue="•••••••••"
    width={FIELD_VALUE_WIDTH}
  />
);

export default EncryptedInput;
