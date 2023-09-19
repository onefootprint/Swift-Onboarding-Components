import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import { PlaybookKind } from '@/playbooks/utils/machine/types';

import type { WhoToOnboardProps } from './who-to-onboard';
import WhoToOnboard from './who-to-onboard';

const renderWhoToOnboard = ({ onSubmit }: WhoToOnboardProps) =>
  customRender(<WhoToOnboard onSubmit={onSubmit} />);

describe('<WhoToOnboard />', () => {
  it('should submit KYC correctly', async () => {
    const onSubmit = jest.fn();
    renderWhoToOnboard({ onSubmit });
    const submit = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledWith({ kind: PlaybookKind.Kyc });
  });

  it('should submit KYB correctly', async () => {
    const onSubmit = jest.fn();
    renderWhoToOnboard({ onSubmit });
    const option = screen.getByText(
      'Onboard businesses and their beneficial owners',
    );
    await userEvent.click(option);
    const submit = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledWith({ kind: PlaybookKind.Kyb });
  });

  it('should have next but no back button', async () => {
    const onSubmit = jest.fn();
    renderWhoToOnboard({ onSubmit });
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Back' }),
    ).not.toBeInTheDocument();
  });
});
