import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themes } from 'ui';

const { light } = themes;

export const customRender = (Component: JSX.Element) =>
  render(<ThemeProvider theme={light}>{Component}</ThemeProvider>);

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
