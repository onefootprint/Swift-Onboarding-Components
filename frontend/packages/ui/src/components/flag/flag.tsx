import type { CountryCode } from '@onefootprint/types';
import React from 'react';

export type FlagProps = {
  className?: string;
  code: CountryCode;
  testID?: string;
};

const Flag = ({ code, testID, className = '' }: FlagProps) => (
  <div className={`fp-f f-${code} ${className}`} data-testid={testID} />
);

export default Flag;
