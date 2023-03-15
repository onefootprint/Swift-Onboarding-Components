import { useObserveCollector } from '@onefootprint/dev-tools';
import React from 'react';
import { ErrorBoundary as RErrorBoundary } from 'react-error-boundary';

import Error from './components/error';

export type ErrorBoundaryProps = {
  children: React.ReactNode;
};

const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  const observeCollector = useObserveCollector();

  return (
    <RErrorBoundary
      FallbackComponent={Error}
      onError={(error, stack) => {
        observeCollector.logError('error', error, { stack });
      }}
    >
      {children}
    </RErrorBoundary>
  );
};

export default ErrorBoundary;
