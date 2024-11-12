import type React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { getLogger } from '@/idv/utils';
import { postOrgSdkTelemetryMutation } from '@onefootprint/axios';
import { getSessionId } from '@onefootprint/dev-tools/';
import { getErrorMessage } from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';
import type { ErrorInfo } from 'react';
import ErrorComponent from './components/error';

type AppErrorBoundaryProps = {
  children: React.ReactNode;
  onReset?: () => void;
};

const { logError } = getLogger({ location: 'app-error-boundary' });

const AppErrorBoundary = ({ children, onReset }: AppErrorBoundaryProps) => {
  const mutSdkTelemetry = useMutation(postOrgSdkTelemetryMutation());

  const handleError = (error: Error, stack: ErrorInfo) => {
    const errorMessage = getErrorMessage(error);
    const stackTrace = String(stack.componentStack).slice(0, 100);
    const contextMessage = `AppErrorBoundary, stack: ${stackTrace}`;

    console.error(contextMessage, error);

    logError(contextMessage, error);

    mutSdkTelemetry.mutate({
      body: {
        logLevel: 'error',
        logMessage: `AppErrorBoundary error: ${errorMessage}, stack: ${stackTrace}`,
        sessionId: getSessionId(),
        tenantDomain: window.location.href,
      },
    });
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorComponent} onError={handleError} onReset={onReset}>
      {children}
    </ErrorBoundary>
  );
};

export default AppErrorBoundary;
