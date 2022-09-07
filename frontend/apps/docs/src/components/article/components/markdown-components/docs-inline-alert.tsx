import React from 'react';
import { InlineAlert } from 'ui';
import { InlineAlertVariant } from 'ui/src/components/inline-alert/inline-alert.types';

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
