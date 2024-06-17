import React from 'react';
import { ErrorBoundary as RErrorBoundary } from 'react-error-boundary';
import useSession from 'src/hooks/use-session';

import ErrorComponent from './components/error';

export type ErrorBoundaryProps = {
  children: React.ReactNode;
};

const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  return <RErrorBoundary FallbackComponent={ErrorComponent}>{children}</RErrorBoundary>;
};

export default ErrorBoundary;
