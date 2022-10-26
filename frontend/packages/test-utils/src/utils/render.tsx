import '@testing-library/jest-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';

import throwOnConsoleErrors from './console-error';

const queryClient = new QueryClient({
  logger: {
    log: console.log,
    warn: console.warn,
    error: process.env.NODE_ENV === 'test' ? () => {} : console.error,
  },
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

type WrapperProps = {
  children: React.ReactNode;
};

export const Wrapper = ({ children }: WrapperProps) => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DesignSystemProvider theme={themes.light}>
        {children}
      </DesignSystemProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export const HookWrapper = ({ children }: WrapperProps) => (
  <React.StrictMode>
    <ThemeProvider theme={themes.light}>{children}</ThemeProvider>
  </React.StrictMode>
);

export const customRender = (Component?: React.ReactNode) => {
  throwOnConsoleErrors();
  return render(<Wrapper>{Component}</Wrapper>);
};

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
