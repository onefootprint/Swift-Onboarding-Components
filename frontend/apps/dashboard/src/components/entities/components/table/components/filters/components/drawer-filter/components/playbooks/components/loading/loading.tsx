import { Shimmer } from '@onefootprint/ui';
import React from 'react';

type LoadingProps = {
  count: number;
};

const Loading = ({ count }: LoadingProps) => (
  <>
    {Array.from({ length: count }).map(() => (
      <Shimmer sx={{ width: '180px', height: '23px' }} key={Math.random()} />
    ))}
  </>
);

export default Loading;
