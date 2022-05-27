import { MDXProvider as ReactMDXProvider } from '@mdx-js/react';
import React from 'react';

import H2 from './components/h2';
import H3 from './components/h3';
import P from './components/p';
import Strong from './components/strong';
import Ul from './components/ul';

const components = {
  h2: H2,
  h3: H3,
  p: P,
  strong: Strong,
  ul: Ul,
};

export type MDXProviderProps = {
  children: React.ReactNode;
};

const MDXProvider = ({ children }: MDXProviderProps) => (
  // Complaining about the types import("mdx/types").MDXComponents
  // Not worth trying to fix, as we would need to create a generic property for the Typography,
  // and won't produce any different behavior.
  // @ts-ignore
  <ReactMDXProvider components={components}>{children}</ReactMDXProvider>
);

export default MDXProvider;
