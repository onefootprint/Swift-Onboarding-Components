import type { InlineAlertVariant } from '@onefootprint/ui';
import { InlineAlert } from '@onefootprint/ui';

type DocsInlineAlertProps = {
  children: React.ReactNode;
  variant: InlineAlertVariant;
};

const DocsInlineAlert = ({ children, variant }: DocsInlineAlertProps) => (
  <InlineAlert marginTop={6} marginBottom={8} variant={variant}>
    {children}
  </InlineAlert>
);

export default DocsInlineAlert;
