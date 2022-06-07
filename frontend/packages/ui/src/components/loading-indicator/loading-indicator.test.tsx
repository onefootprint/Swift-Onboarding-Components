import React from 'react';
import { customRender, screen } from 'test-utils';
import themes from 'themes';

import LoadingIndicator, { LoadingIndicatorProps } from './loading-indicator';

describe('<LoadingIndicator />', () => {
  const renderLoadingIndicator = ({
    'aria-label': ariaLabel,
    testID,
    size,
    color,
  }: Partial<LoadingIndicatorProps>) =>
    customRender(
      <LoadingIndicator
        aria-label={ariaLabel}
        testID={testID}
        color={color}
        size={size}
      />,
    );

  it('should add an aria label', () => {
    renderLoadingIndicator({ 'aria-label': 'loading' });
    expect(screen.getByLabelText('loading')).toBeInTheDocument();
  });

  it('should add a test id attribute', () => {
    renderLoadingIndicator({ testID: 'loading-indicator-test-id' });
    expect(screen.getByTestId('loading-indicator-test-id')).toBeInTheDocument();
  });

  it('should assign the right color', () => {
    renderLoadingIndicator({ color: 'error' });
    const icon = document.getElementsByTagName('path')[0];
    expect(icon.getAttribute('fill')).toEqual(themes.light.color.error);
  });

  it('should render with the correct size', () => {
    renderLoadingIndicator({ size: 'compact' });
    const icon = document.getElementsByTagName('svg')[0];
    expect(icon.getAttribute('width')).toEqual('16');
    expect(icon.getAttribute('height')).toEqual('16');
  });
});
