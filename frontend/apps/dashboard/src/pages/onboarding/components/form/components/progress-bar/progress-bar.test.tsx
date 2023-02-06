import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import ProgressBar, { ProgressBarProps } from './progress-bar';

describe('<ProgressBar />', () => {
  const renderProgressBar = ({
    value = 1,
    max = 5,
    onPrev,
  }: Partial<ProgressBarProps>) =>
    customRender(<ProgressBar value={value} max={max} onPrev={onPrev} />);

  it('should render the correct number of steps', () => {
    renderProgressBar({ max: 10, value: 1 });
    const steps = screen.getAllByRole('presentation');
    expect(steps).toHaveLength(10);
  });

  it('should set the correct active step', () => {
    renderProgressBar({ max: 10, value: 5 });
    const steps = screen.getAllByRole('presentation');
    expect(steps[5]).toHaveAttribute('data-active', 'true');
  });

  describe('when is in the first step', () => {
    it('should not render the prev button', () => {
      renderProgressBar({ value: 0 });
      const prevButton = screen.queryByLabelText('Go back');
      expect(prevButton).not.toBeInTheDocument();
    });
  });

  describe('when is not in the first step', () => {
    it('should render the prev button', () => {
      renderProgressBar({ value: 1 });
      const prevButton = screen.getByLabelText('Go back');
      expect(prevButton).toBeInTheDocument();
    });

    it('should call the onPrev callback when the prev button is clicked', () => {
      const onPrev = jest.fn();
      renderProgressBar({ value: 1, onPrev });
      const prevButton = screen.getByLabelText('Go back');
      prevButton.click();
      expect(onPrev).toHaveBeenCalled();
    });
  });
});
