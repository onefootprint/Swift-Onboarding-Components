import { CodeInline } from '@onefootprint/ui';
import Markdown from 'src/components/markdown';
import ScrollLink from 'src/pages/api-reference/components/scroll-link';

type DescriptionProps = {
  children: string;
};

const OVERRIDES = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  code: (props: any) => <CodeInline disabled size="compact" {...props} />,
  ScrollLink,
};

const Description = ({ children }: DescriptionProps) => <Markdown overrides={OVERRIDES}>{children}</Markdown>;

export default Description;
