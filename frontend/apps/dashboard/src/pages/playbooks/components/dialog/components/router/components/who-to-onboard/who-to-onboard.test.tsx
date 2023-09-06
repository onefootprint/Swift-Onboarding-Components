import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import { Kind } from '@/playbooks/utils/machine/types';

import type { WhoToOnboardProps } from './who-to-onboard';
import WhoToOnboard from './who-to-onboard';

const renderWhoToOnboard = ({ onSubmit }: WhoToOnboardProps) =>
  customRender(<WhoToOnboard onSubmit={onSubmit} />);

describe('<WhoToOnboard />', () => {
  it('should submit KYC correctly', async () => {
    const onSubmit = jest.fn();
    renderWhoToOnboard({ onSubmit });
    const KYC = screen.getByText('Onboard people');
    await userEvent.click(KYC);
    const submit = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledWith({ kind: Kind.KYC });
  });

  it('should submit KYB correctly', async () => {
    const onSubmit = jest.fn();
    renderWhoToOnboard({ onSubmit });
    const KYC = screen.getByText(
      'Onboard businesses and their beneficial owners',
    );
    await userEvent.click(KYC);
    const submit = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledWith({ kind: Kind.KYB });
  });

  it('should have continue but no back button', async () => {
    const onSubmit = jest.fn();
    renderWhoToOnboard({ onSubmit });
    expect(
      screen.getByRole('button', { name: 'Continue' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Back' }),
    ).not.toBeInTheDocument();
  });
});
