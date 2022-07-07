import '@testing-library/jest-dom';

import { render } from '@testing-library/react';
import FootprintProvider from 'footprint-provider';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'styled-components';
import themes from 'themes';
import { DesignSystemProvider } from 'ui';

import throwOnConsoleErrors from './console-error';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
    },
  },
});

const { light } = themes;

type WrapperProps = {
  children: React.ReactNode;
};

export const Wrapper = ({ children }: WrapperProps) => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FootprintProvider>
        <DesignSystemProvider theme={light}>{children}</DesignSystemProvider>
      </FootprintProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export const HookWrapper = ({ children }: WrapperProps) => (
  <React.StrictMode>
    <ThemeProvider theme={light}>{children}</ThemeProvider>
  </React.StrictMode>
);

export const customRender = (Component?: React.ReactNode) => {
  throwOnConsoleErrors();
  return render(<Wrapper>{Component}</Wrapper>);
};

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
