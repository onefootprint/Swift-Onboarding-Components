import { Stack } from '@onefootprint/ui';

import useUpdateAllowedDomains from '../../hooks/use-update-allowed-domains';
import Domain from './components/domain';
import ErrorComponent from './components/error';
import Loading from './components/loading';

export type ListProps = {
  allowedDomains?: string[];
  error: unknown;
  isPending: boolean;
};

const List = ({ allowedDomains = [], error, isPending }: ListProps) => {
  const domainMutation = useUpdateAllowedDomains();

  const handleRemove = (domain: string) => {
    domainMutation.mutate({
      allowedOrigins: allowedDomains.filter(value => value !== domain),
    });
  };

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorComponent error={error} />;
  }

  return allowedDomains.length ? (
    <Stack
      direction="column"
      gap={5}
      // biome-ignore lint/a11y/useSemanticElements: TODO: change to <ul />
      aria-busy={isPending}
      role="list"
    >
      {allowedDomains.map(domain => (
        <Domain key={domain} domain={domain} onRemove={handleRemove} />
      ))}
    </Stack>
  ) : null;
};

export default List;
