import { QueryClient } from '@tanstack/react-query';

const configureReactQuery = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

export default configureReactQuery;
