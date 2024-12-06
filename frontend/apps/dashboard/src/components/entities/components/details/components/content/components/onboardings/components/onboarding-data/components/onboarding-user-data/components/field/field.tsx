import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import { Stack, Text } from '@onefootprint/ui';
import EncryptedCell from 'src/components/encrypted-cell';

export type FieldProps = {
  di: DataIdentifier;
};

const Field = ({ di }: FieldProps) => {
  return (
    <Stack justify="space-between" align="center" gap={3}>
      <Text variant="body-3" color="tertiary">
        {di}
      </Text>
      <EncryptedCell />
    </Stack>
  );
};

export default Field;
