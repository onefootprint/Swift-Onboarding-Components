import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import FormControls, { FormControlsProps } from './form-controls';

describe('<FormControls />', () => {
  const renderFormControls = ({
    id = 'form',
    max = 5,
    onPrev,
    onSkip,
    value = 1,
  }: Partial<FormControlsProps>) =>
    customRender(
      <FormControls
        id={id}
        max={max}
        onPrev={onPrev}
        onSkip={onSkip}
        value={value}
      />,
    );

  it('should render the steps correctly', () => {
    renderFormControls({ max: 3, value: 0 });
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuemax', '3');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  describe('when clicking on the previous button', () => {
    it('should call the onPrev callback', () => {
      const onPrev = jest.fn();
      renderFormControls({ onPrev, value: 1 });
      const prevButton = screen.getByLabelText('Go back');
      prevButton.click();
      expect(onPrev).toHaveBeenCalled();
    });
  });

  describe('when is the last step', () => {
    it('should render the complete button', () => {
      renderFormControls({ max: 3, value: 2 });
      const submitButton = screen.getByRole('button', { name: 'Complete' });
      expect(submitButton).toBeInTheDocument();
    });

    it('should render the skip button', () => {
      renderFormControls({ max: 3, value: 2 });
      const skipButton = screen.getByRole('button', { name: 'Skip' });
      expect(skipButton).toBeInTheDocument();
    });

    describe('when clicking on the skip button', () => {
      it('should call the onSkip callback', () => {
        const onSkip = jest.fn();
        renderFormControls({ max: 3, onSkip, value: 2 });
        const skipButton = screen.getByRole('button', { name: 'Skip' });
        skipButton.click();
        expect(onSkip).toHaveBeenCalled();
      });
    });
  });

  describe('when is not the last step', () => {
    it('should render the next button', () => {
      renderFormControls({ max: 3, value: 1 });
      const submitButton = screen.getByRole('button', { name: 'Next' });
      expect(submitButton).toBeInTheDocument();
    });
  });

  it('should attach the form id to the submit button', () => {
    renderFormControls({ id: 'form' });
    const submitButton = screen.getByRole('button', { name: 'Next' });
    expect(submitButton).toHaveAttribute('form', 'form');
  });
});
