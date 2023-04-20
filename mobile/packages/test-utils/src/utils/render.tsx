import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react-native';
import React from 'react';

import throwOnConsoleErrors from './console-error';

const queryCache = new QueryCache();

beforeEach(() => {
  queryCache.clear();
});

const queryClient = new QueryClient({
  queryCache,
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
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

export const customRender = (Component?: React.ReactNode) => {
  throwOnConsoleErrors();
  render(<Wrapper>{Component}</Wrapper>);
};

export const customRenderHook = (render: (initialProps: any) => any) => {
  throwOnConsoleErrors();
  return renderHook(render, { wrapper: Wrapper });
};

export * from '@testing-library/react-native';
