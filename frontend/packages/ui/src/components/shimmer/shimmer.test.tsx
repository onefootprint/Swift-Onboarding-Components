import React from 'react';
import { customRender, screen } from 'test-utils';

import Shimmer, { ShimmerProps } from './shimmer';

describe('<Shimmer />', () => {
  const renderShimmer = ({
    'aria-valuetext': ariaValuetext,
    sx,
    testID,
  }: Partial<ShimmerProps>) =>
    customRender(
      <Shimmer aria-valuetext={ariaValuetext} testID={testID} sx={sx} />,
    );

  describe('<Shimmer />', () => {
    it('should assign a testID', () => {
      renderShimmer({
        testID: 'shimmer-test-id',
      });
      expect(screen.getByTestId('shimmer-test-id')).toBeInTheDocument();
    });

    it('should add the correct styles', () => {
      renderShimmer({
        sx: {
          height: '100px',
          width: '200px',
        },
      });
      expect(screen.getByRole('progressbar')).toHaveStyle({
        height: '100px',
        width: '200px',
      });
    });
  });
});
