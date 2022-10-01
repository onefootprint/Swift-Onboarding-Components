import { InlineAlert, InlineAlertVariant } from '@onefootprint/ui';
import React from 'react';

type DocsInlineAlertProps = {
  children: string;
  variant: InlineAlertVariant;
};

const DocsInlineAlert = ({ children, variant }: DocsInlineAlertProps) => (
  <InlineAlert sx={{ marginTop: 6, marginBottom: 8 }} variant={variant}>
    {children}
  </InlineAlert>
);

export default DocsInlineAlert;
