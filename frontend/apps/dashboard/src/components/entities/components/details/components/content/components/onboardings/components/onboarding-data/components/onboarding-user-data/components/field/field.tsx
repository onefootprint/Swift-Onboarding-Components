import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import EncryptedCell from 'src/components/encrypted-cell';
import type { UseFieldProps } from '../../hooks/use-field';

export type FieldProps = {
  di: DataIdentifier;
  useField: (di: DataIdentifier) => UseFieldProps;
};

const Field = ({ di, useField }: FieldProps) => {
  const { label, value, isDecrypted, isEmpty } = useField(di);

  const renderValue = () => {
    if (isDecrypted || isEmpty) {
      return <span className="text-body-3">{typeof value === 'string' ? value : '-'}</span>;
    }
    return <EncryptedCell />;
  };

  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-body-3 text-tertiary">{label}</span>
      {renderValue()}
    </div>
  );
};

export default Field;
