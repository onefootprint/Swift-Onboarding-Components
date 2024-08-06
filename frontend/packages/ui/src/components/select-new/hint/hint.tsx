import Stack from '../../stack';
import Text from '../../text';

const Hint = ({ text }: { text: string }) => (
  <Stack marginTop={2}>
    <Text variant="caption-1" color="tertiary">
      {text}
    </Text>
  </Stack>
);

export default Hint;
