import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import OnboardingTemplates from '.';
import type { OnboardingTemplatesProps } from './onboarding-templates';

const renderOnboardingTemplates = ({
  onSubmit,
  onBack,
}: OnboardingTemplatesProps) =>
  customRender(<OnboardingTemplates onSubmit={onSubmit} onBack={onBack} />);

describe('<OnboardingTemplates />', () => {
  it('should render correctly', () => {
    const onSubmit = jest.fn();
    const onBack = jest.fn();
    renderOnboardingTemplates({ onSubmit, onBack });
    expect(
      screen.getByText(
        'Configure your own KYC settings or select a pre-defined template from an external provider.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getByText('Alpaca')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('When Alpaca is selected, onSubmit is called with alpaca', async () => {
    const onSubmit = jest.fn();
    const onBack = jest.fn();
    renderOnboardingTemplates({ onSubmit, onBack });
    await userEvent.click(screen.getByText('Alpaca'));
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onSubmit).toHaveBeenCalledWith({ template: 'alpaca' });
  });

  it('When Custom is selected, onSubmit is called with custom', async () => {
    const onSubmit = jest.fn();
    const onBack = jest.fn();
    renderOnboardingTemplates({ onSubmit, onBack });
    await userEvent.click(screen.getByText('Custom'));
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onSubmit).toHaveBeenCalledWith({ template: 'custom' });
  });

  it('When back is pressed, back is called correctly', async () => {
    const onSubmit = jest.fn();
    const onBack = jest.fn();
    renderOnboardingTemplates({ onSubmit, onBack });
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalled();
  });
});
