import { FlagUs } from '@onefootprint/flags';
import styled, { css } from '@onefootprint/styled';
import type { CountryCode } from '@onefootprint/types';
import capitalize from 'lodash/capitalize';
import React, { lazy, memo, Suspense } from 'react';

export type FlagProps = {
  className?: string;
  code: CountryCode;
  testID?: string;
};

const LazyFlag = lazy(() =>
  import('@onefootprint/flags').then(module => ({
    default: function InnerFlag({ code, testID, className }: FlagProps) {
      const key = capitalize(code) as Capitalize<Lowercase<CountryCode>>;
      const CountryFlag = module.flags[`Flag${key}`];

      return <CountryFlag testID={testID} className={className} />;
    },
  })),
);

const NoFlag = (_: FlagProps) => null; // eslint-disable-line @typescript-eslint/no-unused-vars
const FlagFallback = ({ code, testID, className }: FlagProps) =>
  code === 'US' ? (
    <FlagUs testID={testID} className={className} />
  ) : (
    <NotAnimatedFlagShimmer className={className} />
  );

const Flag = ({ code, testID, className }: FlagProps): JSX.Element => (
  <Suspense
    fallback={
      <FlagFallback code={code} testID={testID} className={className} />
    }
  >
    <LazyFlag code={code} testID={testID} className={className} />
  </Suspense>
);

const NotAnimatedFlagShimmer = styled.div`
  ${({ theme }) => css`
    width: 20px;
    height: 15px;
    background-color: ${theme.backgroundColor.senary};
  `}
`;

export default process.env.NODE_ENV === 'test' ? NoFlag : memo(Flag);
