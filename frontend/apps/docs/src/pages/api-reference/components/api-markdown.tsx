import type { MarkdownToJSX } from 'markdown-to-jsx';
import BaseMarkdown from 'src/components/markdown';
import ScrollLink from 'src/pages/api-reference/components/scroll-link';
import AuthenticationCurlSample from './authentication-curl-sample';
import AuthenticationLoggedInAlert from './authentication-logged-in-alert';
import ErrorSchema from './error-schema';

type ApiMarkdownProps = {
  children: string;
  overrides?: MarkdownToJSX.Overrides;
};

const ApiMarkdown = ({ children, overrides }: ApiMarkdownProps) => {
  const OVERRIDES = {
    ScrollLink,
    ErrorSchema,
    // These two are just utils to help render the specific authentication markdown page
    AuthenticationCurlSample,
    AuthenticationLoggedInAlert,
    ...overrides,
  };
  return <BaseMarkdown overrides={OVERRIDES}>{children}</BaseMarkdown>;
};

export default ApiMarkdown;
