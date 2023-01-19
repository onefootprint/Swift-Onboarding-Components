import { LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';

export type ValueProps = {
  children?: string | null;
  cta: {
    label: string;
    onClick: () => void;
  };
};

const Value = ({ children, cta }: ValueProps) =>
  children ? (
    <Typography variant="body-3">{children}</Typography>
  ) : (
    <LinkButton size="compact" onClick={cta.onClick}>
      {cta.label}
    </LinkButton>
  );

export default Value;
