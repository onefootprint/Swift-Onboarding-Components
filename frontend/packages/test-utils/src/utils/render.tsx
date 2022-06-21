import '@testing-library/jest-dom';

import { render } from '@testing-library/react';
import FootprintProvider from 'footprint-provider';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import themes from 'themes';

import throwOnConsoleErrors from './console-error';

const { light } = themes;

type WrapperProps = {
  children: React.ReactNode;
};

export const Wrapper = ({ children }: WrapperProps) => (
  <React.StrictMode>
    <FootprintProvider>
      <ThemeProvider theme={light}>{children}</ThemeProvider>
    </FootprintProvider>
  </React.StrictMode>
);

export const customRender = (Component?: React.ReactNode) => {
  throwOnConsoleErrors();
  return render(
    <Wrapper>
      <div id="footprint-portal" />
      {Component}
    </Wrapper>,
  );
};

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
