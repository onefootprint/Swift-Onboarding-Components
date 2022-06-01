import { flags } from 'icons';
import capitalize from 'lodash/capitalize';
import React from 'react';
import type { CountryCode } from 'types';

export type FlagProps = {
  className?: string;
  code: CountryCode;
  testID?: string;
};

const Flag = ({ code, testID, className }: FlagProps) => {
  const capitalizedKey = capitalize(code) as Capitalize<Lowercase<CountryCode>>;
  const FlagComponent = flags[`Flag${capitalizedKey}`];
  return <FlagComponent testID={testID} className={className} />;
};

export default Flag;
