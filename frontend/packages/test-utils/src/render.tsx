import '@testing-library/jest-dom';

import { render } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { themes } from 'ui';

const { light } = themes;

type WrapperProps = {
  children: JSX.Element;
};

export const Wrapper = ({ children }: WrapperProps) => (
  <ThemeProvider theme={light}>{children}</ThemeProvider>
);

export const customRender = (Component: JSX.Element) =>
  render(<Wrapper>{Component}</Wrapper>);

export * from '@testing-library/react';
export { renderHook } from '@testing-library/react-hooks';
export { default as userEvent } from '@testing-library/user-event';
