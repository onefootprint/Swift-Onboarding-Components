import { Shimmer } from '@onefootprint/ui';
import React from 'react';

type LoadingProps = {
  count: number;
};

const Loading = ({ count }: LoadingProps) => (
  <>
    {Array.from({ length: count }).map(() => (
      <Shimmer height="23px" width="180px" key={Math.random()} />
    ))}
  </>
);

export default Loading;
