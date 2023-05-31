import { flags } from '@onefootprint/icons';
import type { CountryCode } from '@onefootprint/types';
import capitalize from 'lodash/capitalize';
import React from 'react';

export type FlagProps = {
  style?: string;
  code: CountryCode;
};

const Flag = ({ code, style }: FlagProps) => {
  const capitalizedKey = capitalize(code) as Capitalize<Lowercase<CountryCode>>;
  const FlagComponent = flags[`Flag${capitalizedKey}`];

  return <FlagComponent style={style} />;
};

export default Flag;
