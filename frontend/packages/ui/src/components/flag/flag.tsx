import type { CountryCode } from '@onefootprint/types';
import React from 'react';

export type FlagProps = {
  className?: string;
  code: CountryCode;
  testID?: string;
};

const Flag = ({ code, testID, className }: FlagProps) => (
  <svg
    className={className}
    data-testid={testID}
    width={20}
    height={15}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <use xlinkHref={`#flag-${code.toLowerCase()}`} />
  </svg>
);

export default process.env.NODE_ENV === 'test'
  ? (_: FlagProps) => null // eslint-disable-line @typescript-eslint/no-unused-vars
  : Flag;
