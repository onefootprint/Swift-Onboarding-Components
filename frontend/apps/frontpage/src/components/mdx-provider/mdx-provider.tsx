import { MDXProvider as ReactMDXProvider } from '@mdx-js/react';
import type React from 'react';

import A from './components/a';
import H2 from './components/h2';
import H3 from './components/h3';
import Ol from './components/ol';
import P from './components/p';
import Strong from './components/strong';
import Ul from './components/ul';

const components = {
  a: A,
  h2: H2,
  h3: H3,
  ol: Ol,
  p: P,
  strong: Strong,
  ul: Ul,
};

export type MDXProviderProps = {
  children: React.ReactNode;
};

const MDXProvider = ({ children }: MDXProviderProps) => (
  // Complaining about the types import("mdx/types").MDXComponents
  // Not worth trying to fix, as we would need to create a generic property for the Text,
  // and won't produce any different behavior.
  // @ts-ignore
  <ReactMDXProvider components={components}>{children}</ReactMDXProvider>
);

export default MDXProvider;
