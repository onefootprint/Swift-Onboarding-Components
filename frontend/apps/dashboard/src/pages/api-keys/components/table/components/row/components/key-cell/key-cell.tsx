import { CodeInline, Shimmer } from '@onefootprint/ui';
import { EncryptedCell } from 'src/components';

type KeyCellProps = {
  isLoading: boolean;
  value: string | null;
};

const KeyCell = ({ value, isLoading }: KeyCellProps) => {
  if (isLoading) {
    return <Shimmer height="24px" width="280px" />;
  }

  return value ? (
    <CodeInline isPrivate truncate>
      {value}
    </CodeInline>
  ) : (
    <EncryptedCell />
  );
};

export default KeyCell;
