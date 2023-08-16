import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import Router from './router';

const renderRouter = ({ onClose }: { onClose: () => void }) =>
  customRender(<Router onClose={onClose} />);

describe('<Router />', () => {
  it("should navigate from 'Your Playbook' to 'Who to onboard' screen by way of stepper", async () => {
    renderRouter({ onClose: jest.fn() });
    const KYC = screen.getByText('Onboard people');
    await userEvent.click(KYC);
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);
    expect(
      screen.getByText('Your Playbook recommendation'),
    ).toBeInTheDocument();

    const whoToOnboard = screen.getByRole('button', {
      name: 'Who to onboard',
    });
    await userEvent.click(whoToOnboard);
    expect(
      screen.getByText('Who would you like to onboard?'),
    ).toBeInTheDocument();
  });
});
