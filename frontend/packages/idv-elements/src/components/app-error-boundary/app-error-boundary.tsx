import { useObserveCollector } from '@onefootprint/dev-tools';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Error from './components/error';

type AppErrorBoundaryProps = {
  children: React.ReactNode;
  onReset?: () => void;
};

const AppErrorBoundary = ({ children, onReset }: AppErrorBoundaryProps) => {
  const observeCollector = useObserveCollector();

  return (
    <ErrorBoundary
      FallbackComponent={Error}
      onError={(error, stack) => {
        observeCollector.logError('error', error, { stack });
      }}
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  );
};

export default AppErrorBoundary;
