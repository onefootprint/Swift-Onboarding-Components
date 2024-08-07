import { CodeInline } from '@onefootprint/ui';
import Markdown from 'src/components/markdown';

type DescriptionProps = {
  children: string;
};

const OVERRIDES = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  code: (props: any) => <CodeInline disabled size="compact" {...props} />,
};

const Description = ({ children }: DescriptionProps) => <Markdown overrides={OVERRIDES}>{children}</Markdown>;

export default Description;
