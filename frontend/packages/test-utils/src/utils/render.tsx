import '@testing-library/jest-dom';
import * as React from 'react';

import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';
import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';

import throwOnConsoleErrors from './console-error';

const queryCache = new QueryCache();

beforeEach(() => {
  queryCache.clear();
});

const queryClient = new QueryClient({
  queryCache,
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
        <DesignSystemProvider theme={themes.light}>{children}</DesignSystemProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export const customRender = (Component?: React.ReactNode): ReturnType<typeof render> => {
  throwOnConsoleErrors();
  return render(<Wrapper>{Component}</Wrapper>);
};

export const customRenderHook = (
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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

global.React = React;
