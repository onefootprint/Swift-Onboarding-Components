import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import { Kind } from '@/playbooks/utils/machine/types';

import WhoToOnboard, { WhoToOnboardProps } from './who-to-onboard';

const renderWhoToOnboard = ({ onBack, onSubmit }: WhoToOnboardProps) =>
  customRender(<WhoToOnboard onBack={onBack} onSubmit={onSubmit} />);

describe('<WhoToOnboard />', () => {
  it('should submit KYC correctly', async () => {
    const onSubmit = jest.fn();
    renderWhoToOnboard({ onSubmit, onBack: jest.fn() });
    const KYC = screen.getByText('Onboard people');
    await userEvent.click(KYC);
    const submit = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledWith({ kind: Kind.KYC });
  });

  it('should submit KYB correctly', async () => {
    const onSubmit = jest.fn();
    renderWhoToOnboard({ onSubmit, onBack: jest.fn() });
    const KYC = screen.getByText(
      'Onboard businesses and their beneficial owners',
    );
    await userEvent.click(KYC);
    const submit = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledWith({ kind: Kind.KYB });
  });

  it('should quit out of form correctly', async () => {
    const onBack = jest.fn();
    renderWhoToOnboard({ onSubmit: jest.fn(), onBack });
    const submit = screen.getByRole('button', { name: 'Back' });
    await userEvent.click(submit);
    expect(onBack).toHaveBeenCalled();
  });
});
