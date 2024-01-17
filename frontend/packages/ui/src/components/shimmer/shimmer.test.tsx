import '../../config/initializers/i18next-test';

import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import type { ShimmerProps } from './shimmer';
import Shimmer from './shimmer';

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
