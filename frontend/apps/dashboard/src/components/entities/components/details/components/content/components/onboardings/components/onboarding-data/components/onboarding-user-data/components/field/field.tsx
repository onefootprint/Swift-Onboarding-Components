import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import { Shimmer, Stack, Text } from '@onefootprint/ui';
import EncryptedCell from 'src/components/encrypted-cell';
import { useDecryptControls } from '../../../../../../../vault/components/vault-actions';
import type { UseFieldProps } from '../../hooks/use-field';

export type FieldProps = {
  di: DataIdentifier;
  useField: (di: DataIdentifier) => UseFieldProps;
};

const Field = ({ di, useField }: FieldProps) => {
  const { label, value, isDecrypted, isEmpty } = useField(di);
  const decryptControls = useDecryptControls();

  const renderValue = () => {
    if (decryptControls.inProgressDecryptingAll) {
      return <Shimmer height="20px" width="100px" />;
    }
    if (isDecrypted || isEmpty) {
      return <Text variant="body-3">{value ? (value as string) : '-'}</Text>;
    }
    return <EncryptedCell />;
  };

  return (
    <Stack justify="space-between" align="center" gap={3}>
      <Text variant="body-3" color="tertiary">
        {label}
      </Text>
      {renderValue()}
    </Stack>
  );
};

export default Field;
