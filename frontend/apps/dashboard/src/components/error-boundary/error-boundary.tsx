import { useObserveCollector } from '@onefootprint/dev-tools';
import React from 'react';
import { ErrorBoundary as RErrorBoundary } from 'react-error-boundary';
import useSession from 'src/hooks/use-session';

import ErrorComponent from './components/error';

export type ErrorBoundaryProps = {
  children: React.ReactNode;
};

const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  const observeCollector = useObserveCollector();
  const { data } = useSession();
  observeCollector.setAppContext({
    meta: data.meta,
    org: data.org,
    user: data.user,
  });

  return (
    <RErrorBoundary
      FallbackComponent={ErrorComponent}
      onError={(error, stack) => {
        observeCollector.logError('error', error, { stack });
      }}
    >
      {children}
    </RErrorBoundary>
  );
};

export default ErrorBoundary;
