import type { MarkdownToJSX } from 'markdown-to-jsx';
import BaseMarkdown from 'src/components/markdown';
import ScrollLink from 'src/pages/api-reference/components/scroll-link';
import ErrorSchema from './error-schema';

type ApiMarkdownProps = {
  children: string;
  overrides?: MarkdownToJSX.Overrides;
};

const ApiMarkdown = ({ children, overrides }: ApiMarkdownProps) => {
  const OVERRIDES = {
    ScrollLink,
    ErrorSchema,
    ...overrides,
  };
  return <BaseMarkdown overrides={OVERRIDES}>{children}</BaseMarkdown>;
};

export default ApiMarkdown;
