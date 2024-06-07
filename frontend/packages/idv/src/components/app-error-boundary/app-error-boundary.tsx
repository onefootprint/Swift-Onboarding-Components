import { getErrorMessage } from '@onefootprint/request';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { Logger } from '../../utils/logger';
import ErrorComponent from './components/error';

type AppErrorBoundaryProps = {
  children: React.ReactNode;
  onReset?: () => void;
};

const AppErrorBoundary = ({ children, onReset }: AppErrorBoundaryProps) => (
  <ErrorBoundary
    FallbackComponent={ErrorComponent}
    onError={(error, stack) => {
      // TODO: polish stack trace logging
      Logger.error(`${getErrorMessage(error)}, stack: ${stack.componentStack}`);
    }}
    onReset={onReset}
  >
    {children}
  </ErrorBoundary>
);

export default AppErrorBoundary;
