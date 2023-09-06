import type { CountryCode } from '@onefootprint/types';
import capitalize from 'lodash/capitalize';
import React, { lazy, Suspense } from 'react';

export type FlagProps = {
  className?: string;
  code: CountryCode;
  testID?: string;
};

const FakeFlag = (_: FlagProps) => null; // eslint-disable-line @typescript-eslint/no-unused-vars

const LazyFlag = lazy(() =>
  import('@onefootprint/flags').then(module => ({
    default: function InnerFlag({ code, testID, className }: FlagProps) {
      const key = capitalize(code) as Capitalize<Lowercase<CountryCode>>;
      const CountryFlag = module.flags[`Flag${key}`];

      return <CountryFlag testID={testID} className={className} />;
    },
  })),
);

const Flag = ({ code, testID, className }: FlagProps): JSX.Element => (
  <Suspense fallback={null}>
    <LazyFlag code={code} testID={testID} className={className} />
  </Suspense>
);

export default process.env.NODE_ENV === 'test' ? FakeFlag : Flag;
