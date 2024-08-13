import { ApiKey } from '@onefootprint/types';
import { CodeInline, Shimmer } from '@onefootprint/ui';

type KeyCellProps = {
  isLoading: boolean;
  value: ApiKey;
};

const KeyCell = ({ value, isLoading }: KeyCellProps) => {
  if (isLoading) {
    return <Shimmer height="24px" width="280px" />;
  }

  return (
    <CodeInline isPrivate truncate disabled={!value.key}>
      {value.key ? value.key : value.scrubbedKey.replaceAll('*', '•')}
    </CodeInline>
  );
};

export default KeyCell;
