import type { ApiKey } from '@onefootprint/types';
import { CodeInline, Shimmer } from '@onefootprint/ui';

type KeyCellProps = {
  isPending: boolean;
  value: ApiKey;
};

const KeyCell = ({ value, isPending }: KeyCellProps) => {
  if (isPending) {
    return <Shimmer height="24px" width="280px" />;
  }

  return (
    <CodeInline isPrivate disabled={!value.key}>
      {value.key ? value.key : value.scrubbedKey.replaceAll('*', '•')}
    </CodeInline>
  );
};

export default KeyCell;
