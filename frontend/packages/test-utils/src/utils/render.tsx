import '@testing-library/jest-dom';

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';
import React from 'react';
import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';

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

export const Wrapper = ({ children }: WrapperProps) => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <DesignSystemProvider theme={themes.light}>
          {children}
        </DesignSystemProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export const customRender = (Component?: React.ReactNode) => {
  throwOnConsoleErrors();
  return render(<Wrapper>{Component}</Wrapper>);
};

export const customRenderHook = (
  render: (initialProps: any) => any,
  wrapper?: (props: WrapperProps) => JSX.Element,
) => {
  throwOnConsoleErrors();
  return renderHook(render, { wrapper: wrapper ?? Wrapper });
};

export {
  screen,
  within,
  waitFor,
  waitForElementToBeRemoved,
  renderHook,
  act,
  render,
  fireEvent,
} from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
