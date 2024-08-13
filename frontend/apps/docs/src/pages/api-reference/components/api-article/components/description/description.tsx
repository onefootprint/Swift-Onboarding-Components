import { CodeInline } from '@onefootprint/ui';
import ApiMarkdown from '../../../api-markdown';

type DescriptionProps = {
  children: string;
};

const Description = ({ children }: DescriptionProps) => {
  const OVERRIDES = {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    code: (props: any) => <CodeInline disabled size="compact" {...props} />,
  };
  return <ApiMarkdown overrides={OVERRIDES}>{children}</ApiMarkdown>;
};

export default Description;
